window.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('username', username);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('token', data.token);
                    alert('Login successful!');

                    // Redirect based on role immediately
                    window.location.href = data.role === 'admin' ? 'AdminProfile.html' : 'UserAccount.html';
                } else {
                    alert('Invalid username or password.');
                }
            } catch (error) {
                console.error('Login Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // User Authentication Check
    const userButton = document.querySelector('.user-button');
    if (userButton) {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || !role) {
            userButton.addEventListener('click', (event) => {
                event.preventDefault();
                alert('You need to log in!');
            });
        } else {
            // Set the correct href based on role immediately
            userButton.setAttribute('href', role === 'admin' ? 'AdminProfile.html' : 'UserAccount.html');
        }
    }
});
