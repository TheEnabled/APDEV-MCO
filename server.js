require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { ObjectId } = require("mongoose").Types;

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files
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

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Access denied" });

    jwt.verify(token, "secret_key", (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Invalid token" });

        req.username = decoded.username;
        req.role = decoded.role;  // ✅ Extract role from the token
        next();
    });
};



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

// Fetch User Info
app.get("/api/user/:username", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user data" });
    }
});

// Update User Info
app.put("/api/user/:username", verifyToken, async (req, res) => {
    try {
        const updates = req.body;
        if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
        
        const user = await User.findOneAndUpdate({ username: req.params.username }, updates, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user" });
    }
});

// Review Schema and Model
const ReviewSchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
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

//Edit Reviews
app.put("/api/reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid review ID." });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { content },
            { new: true } // Return the updated document
        );

        if (!updatedReview) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        res.json({ success: true, message: "Review updated successfully.", review: updatedReview });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

  //Delete reviews
  app.delete("/api/reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid review ID." });
        }

        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        res.json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Fetch all users with role "user"
app.get("/api/users", verifyToken, async (req, res) => {
    if (req.role !== "admin") { // ✅ Use req.role instead of req.username
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    try {
        const users = await User.find({ role: "user" }); // Fetch only user accounts
        res.json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
});

// Update User Info - Make sure this route is correctly implemented in your server.js
app.put("/api/user/:username", verifyToken, async (req, res) => {
    try {
        // Check if user is updating their own account or if they're an admin
        if (req.username !== req.params.username && req.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "You can only update your own information" 
            });
        }
        
        const updates = req.body;
        
        // If password is being updated, hash it first
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        
        // Find and update the user
        const user = await User.findOneAndUpdate(
            { username: req.params.username }, 
            updates, 
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        // Return success with updated user info (excluding password)
        const userResponse = {
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone
        };
        
        res.json({ 
            success: true, 
            message: "User updated successfully", 
            user: userResponse 
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating user information" 
        });
    }
});


// Delete a user by username
app.delete("/api/users/:username", verifyToken, async (req, res) => {
    try {
        // Check if requesting user is admin
        if (req.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const result = await User.deleteOne({ username: req.params.username });

        if (result.deletedCount === 1) {
            res.json({ success: true, message: "User deleted successfully." });
        } else {
            res.json({ success: false, message: "User not found." });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
});






  
// Default Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "MCO Page", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
