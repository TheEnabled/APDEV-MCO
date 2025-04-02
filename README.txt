# Dimsum Treats - Ordering Website

This project is a web-based ordering system for dimsum products. Users can create accounts, log in, add items to their cart, and check out. Admins have separate privileges, including user management.

---

## 🚀 How to Run Locally

Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Includes npm)
- [MongoDB](https://www.mongodb.com/)

---

Installation Steps

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-repo-url.git
   cd your-project-folder

2. Install Dependencies
	npm install

3. Run MongoDB
	mongod

4. Start the server
	node server.js

5. Open the website in a browser
	http://localhost:3000

📌 Features
✔️ User Authentication - Register & log in
✔️ Cart System - Add/remove products & adjust quantity
✔️ Checkout Process - Confirm order details
✔️ Admin Panel - Manage users (Admins are pre-configured in MongoDB)
✔️ Role-Based Access - Users & Admins have different permissions

/Dimsum-Treats
│── /Files
│    ├── /CSSFiles      # Stylesheets
│    ├── /images        # Product images
│── server.js           # Main server file
│── package.json        # Dependencies & scripts
│── README.md           # Project documentation


🛠 Admin Functionality
Admins can delete user profiles.

Users can only view and edit their own profile.

Admin accounts must be manually added in MongoDB Compass.

🔗 Additional Notes
If you encounter MongoDB connection issues, check if the MongoDB service is running or use this command to start it:
mongod --dbpath=/path/to/your/data/db

Default login credentials for testing:
ADMIN
Username: admin1
Password: admin1

USER
Username: testt
Password: testt
