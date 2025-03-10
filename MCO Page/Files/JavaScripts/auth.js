document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Login successful!");
                localStorage.setItem("token", result.token); // Store JWT token
                window.location.href = "MainPage.html"; // Redirect to main page
            } else {
                alert("Login failed: " + result.message);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("signup-username").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;

            const response = await fetch("http://localhost:3000/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Signup successful! Please log in.");
                window.location.href = "Login.html"; // Redirect to login page
            } else {
                alert("Signup failed: " + result.message);
            }
        });
    }
});
