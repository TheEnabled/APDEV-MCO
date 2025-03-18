require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "MCO Page" directory
app.use(express.static(path.join(__dirname, "MCO Page")));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    fullName: { type: String },
    phone: { type: String }
});

const User = mongoose.model("User", UserSchema);

// Signup Route
app.post("/api/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.json({ success: false, message: "Error registering user" });
    }
});

// Login Route
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        const token = jwt.sign({ username: user.username, role: user.role }, "secret_key", { expiresIn: "1h" });
        res.json({ success: true, token, role: user.role });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Login error" });
    }
});

// Fetch User Data Route
app.get("/api/user/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ success: false, message: "Error fetching user data" });
    }
});

// Update User Data Route
app.put("/api/user/:username", async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        const updatedData = { fullName, email, phone };
        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            updatedData,
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User updated successfully!", user });
    } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).json({ success: false, message: "Error updating user data" });
    }
});

// Serve the homepage on accessing the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "MCO Page", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
