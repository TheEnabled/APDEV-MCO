document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");  // Fetch the token as well
    const statusMessage = document.getElementById("status-message");

    if (!username || !token) {
        alert("You need to log in!");
        window.location.href = "Login.html";
        return;
    }

    // Fetch user data with proper URL
    try {
        const response = await fetch(`http://localhost:3000/api/user/${username}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("user-name").textContent = data.user.username;
            document.getElementById("fullName").value = data.user.fullName || "";
            document.getElementById("email").value = data.user.email;
            document.getElementById("phone").value = data.user.phone || "";
        } else {
            alert("Failed to load user data.");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }

    // Enable edit mode
    const editButton = document.getElementById("edit-button");
    const saveButton = document.getElementById("save-button");
    const inputs = document.querySelectorAll("#user-form input");

    editButton.addEventListener("click", () => {
        inputs.forEach(input => input.disabled = false);
        editButton.style.display = "none";
        saveButton.style.display = "block";
    });

    // Save updated user data
    saveButton.addEventListener("click", async () => {
        const updatedData = {
            fullName: document.getElementById("fullName").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch(`http://localhost:3000/api/user/${username}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (result.success) {
                statusMessage.textContent = "✅ Profile updated successfully!";
                statusMessage.style.color = "green";
                inputs.forEach(input => input.disabled = true);
                saveButton.style.display = "none";
                editButton.style.display = "block";
            } else {
                statusMessage.textContent = "❌ Failed to update profile!";
                statusMessage.style.color = "red";
            }
        } catch (error) {
            console.error("Error updating user data:", error);
            statusMessage.textContent = "❌ Error updating profile!";
            statusMessage.style.color = "red";
        }
    });
});
