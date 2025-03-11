document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert("✅ Login successful!");
                    localStorage.setItem("token", result.token);
                    localStorage.setItem("role", result.role); // Store role
                    window.location.href = "MainPage.html"; // Redirect after login
                } else {
                    alert("❌ Login failed: " + result.message);
                }
            } catch (error) {
                console.error("🔥 Login Error:", error);
                alert("❌ Login error. Check console.");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.querySelector(".menu-button");

    if (profileButton) {
        profileButton.addEventListener("click", () => {
            const role = localStorage.getItem("role");

            if (role === "admin") {
                window.location.href = "AdminProfile.html";
            } else {
                window.location.href = "UserAccount.html";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profile-button");

    if (profileButton) {
        profileButton.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            
            const role = localStorage.getItem("role");

            if (role === "admin") {
                window.location.href = "AdminProfile.html";
            } else {
                window.location.href = "UserAccount.html";
            }
        });
    }
});
