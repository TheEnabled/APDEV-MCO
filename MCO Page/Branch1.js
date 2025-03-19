document.addEventListener("DOMContentLoaded", () => {
  const branchDropdown = document.getElementById("branch-dropdown");
  const currentBranchElem = document.getElementById("current-branch");
  const reviewsContainer = document.getElementById("reviews-container");
  const publishBtn = document.getElementById("publish-btn");
  const reviewTextarea = document.getElementById("review-textarea");

  // Function to fetch reviews for a given branch (location)
  async function fetchReviews(branchName) {
    reviewsContainer.innerHTML = "<p class='no-reviews'>Loading reviews...</p>";
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${encodeURIComponent(branchName)}`);
      const data = await response.json();
      if (data.success) {
        reviewsContainer.innerHTML = "";
        if (data.reviews.length > 0) {
          data.reviews.forEach(review => {
            const reviewDiv = document.createElement("div");
            reviewDiv.className = "review";
            reviewDiv.style.border = "1px solid #ccc";
            reviewDiv.style.padding = "10px";
            reviewDiv.style.marginBottom = "10px";
            reviewDiv.style.borderRadius = "8px";
            reviewDiv.style.backgroundColor = "#f9f9f9";

            reviewDiv.innerHTML = `
              <strong>${review.userName}</strong>
              <p>${review.content}</p>
              <small>${new Date(review.createdAt).toLocaleString()}</small>
              <hr />
            `;
            reviewsContainer.appendChild(reviewDiv);
          });
        } else {
          reviewsContainer.innerHTML = "<p class='no-reviews'>No reviews yet.</p>";
        }
      } else {
        reviewsContainer.innerHTML = "<p class='no-reviews'>Failed to load reviews.</p>";
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      reviewsContainer.innerHTML = "<p class='no-reviews'>Error loading reviews.</p>";
    }
  }

  // Initial fetch for default branch
  let currentBranch = branchDropdown.value;
  currentBranchElem.textContent = currentBranch;
  fetchReviews(currentBranch);

  // Update reviews when branch is changed
  branchDropdown.addEventListener("change", () => {
    currentBranch = branchDropdown.value;
    currentBranchElem.textContent = currentBranch;
    fetchReviews(currentBranch);
  });

  // Publish a new review
  publishBtn.addEventListener("click", async () => {
    const content = reviewTextarea.value.trim();
    if (!content) {
      alert("Please write a review.");
      return;
    }
    // Retrieve username from localStorage or default to "Anonymous"
    const userName = localStorage.getItem("username") || "Anonymous";
    try {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: currentBranch,
          userName,
          content,
          rating: 0  // Modify if you want to include rating logic
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Review published successfully!");
        reviewTextarea.value = "";
        fetchReviews(currentBranch); // Refresh reviews after publishing
      } else {
        alert("Failed to publish review.");
      }
    } catch (error) {
      console.error("Error publishing review:", error);
      alert("Error publishing review.");
    }
  });
});
