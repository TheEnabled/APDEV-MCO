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

// Serve static files from your public folder (adjust if necessary)
app.use(express.static(path.join(__dirname, "MCO Page")));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// User Schema and Model
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

// ===================
// Review Schema, Model, and Routes
// ===================

// Define Review Schema
const ReviewSchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Create Review Model
const Review = mongoose.model("Review", ReviewSchema);

// POST Route: Create a new review
app.post("/api/reviews", async (req, res) => {
    try {
        const { locationName, userName, content, rating } = req.body;
        const newReview = new Review({ locationName, userName, content, rating });
        await newReview.save();
        console.log("New review saved:", newReview);
        res.json({ success: true, message: "Review posted!", review: newReview });
    } catch (error) {
        console.error("Error creating review:", error);
        res.json({ success: false, message: "Error creating review" });
    }
});

// GET Route: Fetch reviews for a specific location
app.get("/api/reviews/:locationName", async (req, res) => {
    try {
        const { locationName } = req.params;
        const reviews = await Review.find({ locationName }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
});

// ===================
// End of Review Routes
// ===================

// Default Route: Serve the MainPage.html when accessing the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "MCO Page", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
