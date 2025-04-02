document.addEventListener("DOMContentLoaded", () => {
  const branchDropdown = document.getElementById("branch-dropdown");
  const currentBranchElem = document.getElementById("current-branch");
  const reviewsContainer = document.getElementById("reviews-container");
  const publishBtn = document.getElementById("publish-btn");
  const reviewTextarea = document.getElementById("review-textarea");

  // Fetch reviews for a branch
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
            reviewDiv.dataset.id = review._id; // Store review ID

            reviewDiv.innerHTML = `
              <strong>${review.userName}</strong>
              <p class="review-content">${review.content}</p>
              <small>${new Date(review.createdAt).toLocaleString()}</small>
              <button class="edit-btn" data-id="${review._id}">Edit</button>
              <button class="delete-btn" data-id="${review._id}">Delete</button>
              <hr />
            `;
            reviewsContainer.appendChild(reviewDiv);
          });

          // Attach event listeners for edit and delete buttons
          document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", handleEditReview);
          });

          document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", handleDeleteReview);
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
    const userName = localStorage.getItem("username") || "Anonymous";
    try {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: currentBranch,
          userName,
          content,
          rating: 0
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Review published successfully!");
        reviewTextarea.value = "";
        fetchReviews(currentBranch); // Refresh reviews
      } else {
        alert("Failed to publish review.");
      }
    } catch (error) {
      console.error("Error publishing review:", error);
      alert("Error publishing review.");
    }
  });

  // Edit a review
  async function handleEditReview(event) {
    const reviewId = event.target.dataset.id;
    const reviewDiv = event.target.parentElement;
    const contentElem = reviewDiv.querySelector(".review-content");
    const oldContent = contentElem.textContent;

    const inputField = document.createElement("textarea");
    inputField.value = oldContent;
    reviewDiv.replaceChild(inputField, contentElem);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    reviewDiv.appendChild(saveBtn);

    saveBtn.addEventListener("click", async () => {
      const newContent = inputField.value.trim();
      if (!newContent) {
        alert("Review content cannot be empty.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent })
        });

        const data = await response.json();
        if (data.success) {
          alert("Review updated successfully!");
          fetchReviews(currentBranch);
        } else {
          alert("Failed to update review.");
        }
      } catch (error) {
        console.error("Error updating review:", error);
        alert("Error updating review.");
      }
    });
  }

  // Delete a review
  async function handleDeleteReview(event) {
    const reviewId = event.target.dataset.id;

    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (data.success) {
        alert("Review deleted successfully!");
        fetchReviews(currentBranch);
      } else {
        alert("Failed to delete review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review.");
    }
  }
});
