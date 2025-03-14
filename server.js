require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }
});

const User = mongoose.model("User", UserSchema);

// Signup Route 
app.post("/api/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ success: true, message: "Admin registered successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.json({ success: false, message: "Error registering admin" });
    }
});

// Login Route (For both Users & Admins)
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Incorrect password" });

        // Generate JWT with role
        const token = jwt.sign({ username: user.username, role: user.role }, "secret_key", { expiresIn: "1h" });
        res.json({ success: true, token, role: user.role }); // Send role in response
    } catch (error) {
        console.error("Login Error:", error);
        res.json({ success: false, message: "Login error" });
    }
});

// Start Server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
