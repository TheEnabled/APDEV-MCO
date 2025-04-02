window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    
    // Check if user is admin
    if (role !== "admin") {
        alert("You do not have permission to access this page");
        window.location.href = "Login.html";
        return;
    }
    
    // Load admin's own information
    await loadAdminInfo(username, token);
    
    // Setup edit profile functionality
    setupEditProfileHandlers(username, token);
    
    // Fetch users
    try {
        const response = await fetch("http://localhost:3000/api/users", {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" 
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log("Fetched users:", data.users);
            displayUsers(data.users);
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
    
    // Function to load admin's information
    async function loadAdminInfo(username, token) {
        try {
            const response = await fetch(`http://localhost:3000/api/user/${username}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update the profile information on page
                document.querySelector(".user-details p:nth-child(1)").innerHTML = 
                    `<strong>USERNAME:</strong> ${data.user.username} <a href="#" class="edit-link" data-field="username">CHANGE USERNAME?</a>`;
                document.querySelector(".user-details p:nth-child(2)").innerHTML = 
                    `<strong>PASSWORD:</strong> ••••••• <a href="#" class="edit-link" data-field="password">CHANGE PASSWORD?</a>`;
                document.querySelector(".user-details p:nth-child(3)").innerHTML = 
                    `<strong>CONTACT NUMBER:</strong> ${data.user.phone || 'Not set'} <a href="#" class="edit-link" data-field="phone">EDIT CONTACT NO?</a>`;
                document.querySelector(".user-details p:nth-child(4)").innerHTML = 
                    `<strong>EMAIL ADDRESS:</strong> ${data.user.email} <a href="#" class="edit-link" data-field="email">EDIT EMAIL ADDRESS?</a>`;
            } else {
                console.error("Error loading admin info:", data.message);
            }
        } catch (error) {
            console.error("Error fetching admin info:", error);
        }
    }
    
    // Function to set up edit profile event handlers
    function setupEditProfileHandlers(username, token) {
        // Add edit form to the DOM if it doesn't exist
        if (!document.querySelector('.edit-form')) {
            const formHTML = `
                <div class="edit-form">
                    <h3>Edit Profile</h3>
                    <div class="form-group">
                        <label for="edit-field">Field</label>
                        <input type="text" id="edit-field-label" disabled>
                    </div>
                    <div class="form-group">
                        <label for="edit-value">New Value</label>
                        <input type="text" id="edit-value">
                    </div>
                    <div class="form-buttons">
                        <button class="save-btn">Save Changes</button>
                        <button class="cancel-btn">Cancel</button>
                    </div>
                </div>
            `;
            
            const formContainer = document.createElement('div');
            formContainer.innerHTML = formHTML;
            document.querySelector('.account-info').appendChild(formContainer);
        }
        
        // Edit links event handler
        document.querySelectorAll('.edit-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const field = e.target.getAttribute('data-field');
                const editForm = document.querySelector('.edit-form');
                const fieldLabel = document.getElementById('edit-field-label');
                const valueInput = document.getElementById('edit-value');
                
                editForm.classList.add('active');
                fieldLabel.value = field.toUpperCase();
                valueInput.value = '';
                valueInput.type = field === 'password' ? 'password' : 'text';
                
                // Store the field being edited
                editForm.setAttribute('data-editing-field', field);
            });
        });
        
        // Save button handler
        document.querySelector('.save-btn').addEventListener('click', async () => {
            const editForm = document.querySelector('.edit-form');
            const field = editForm.getAttribute('data-editing-field');
            const value = document.getElementById('edit-value').value;
            
            if (!value.trim()) {
                alert('Please enter a value');
                return;
            }
            
            try {
                const updateData = {};
                updateData[field] = value;
                
                const response = await fetch(`http://localhost:3000/api/user/${username}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updateData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
                    editForm.classList.remove('active');
                    
                    // Reload admin info to update the display
                    await loadAdminInfo(username, token);
                } else {
                    alert("Error: " + data.message);
                }
            } catch (error) {
                console.error("Error updating admin info:", error);
                alert("An error occurred while updating your information");
            }
        });
        
        // Cancel button handler
        document.querySelector('.cancel-btn').addEventListener('click', () => {
            document.querySelector('.edit-form').classList.remove('active');
        });
    }
    
    // Function to display users in the table
    function displayUsers(users) {
        const userTable = document.getElementById("userTable").getElementsByTagName('tbody')[0];
        userTable.innerHTML = '';
        
        users.forEach(user => {
            const row = userTable.insertRow();
            
            const usernameCell = row.insertCell(0);
            usernameCell.textContent = user.username;
            
            const emailCell = row.insertCell(1);
            emailCell.textContent = user.email;
            
            const actionsCell = row.insertCell(2);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => deleteUser(user.username);
            actionsCell.appendChild(deleteButton);
        });
    }
    
    // Function to delete a user
    async function deleteUser(username) {
        if (confirm(`Are you sure you want to delete ${username}?`)) {
            try {
                const response = await fetch(`http://localhost:3000/api/users/${username}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert("User deleted successfully");
                    // Refresh the user list
                    location.reload();
                } else {
                    alert("Error: " + data.message);
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("An error occurred while deleting the user");
            }
        }
    }
});