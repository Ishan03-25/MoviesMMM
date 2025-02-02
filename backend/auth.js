const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const JWT_SECRET = "aadhar123"; // Use environment variables in production
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/auth_demo", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Signup Route
app.post("/signup", async (req, res) => {
    const { username, password, contact } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user and save to database
        const newUser = new User({
            username,
            password: hashedPassword,
            contact,
        });

        await newUser.save();

        res.json({
            message: "User signed up successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
});

// Signin Route
app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in the database
        const foundUser = await User.findOne({ username });
        if (!foundUser) {
            return res.status(400).json({
                message: "Invalid username or password",
            });
        }

        // Compare the password
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid username or password",
            });
        }

        // Generate a JWT token
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

        res.json({
            token,
            message: "Logged in successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
});

// Get User Info (Protected Route)
app.get("/me", async (req, res) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            message: "Token not provided",
        });
    }

    try {
        // Verify the token
        const decodedData = jwt.verify(token, JWT_SECRET);

        // Find the user in the database
        const foundUser = await User.findOne({ username: decodedData.username });
        if (!foundUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Respond with user details (excluding the password)
        res.json({
            username: foundUser.username,
            contact: foundUser.contact,
        });
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token",
        });
    }
});

// Start the Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
