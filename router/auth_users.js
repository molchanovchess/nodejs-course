const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = "your_secret_key"; // Ensure this key is consistent

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    console.log("Login attempt:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        return res.status(200).json({ message: "Login successful", token });
    } else {
        return res.status(403).json({ message: "Invalid username or password" });
    }
});

// Middleware for authenticating JWT
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token received:", token);
    if (token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                console.error("Token verification error:", err);
                return res.sendStatus(403);
            }
            req.user = user; // Attach user information to the request
            console.log("Authenticated user:", user); // Log authenticated user
            next();
        });
    } else {
        console.log("No token provided.");
        res.sendStatus(401); // Unauthorized
    }
}
// Apply the middleware to routes that require authentication
regd_users.use(authenticateJWT);


// Add a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log("Request Query:", req.query);
    console.log("Request Params:", req.params);
    
    const { username } = req.user; // Get username from token in middleware
    const { review } = req.body;
    const isbn = req.params.isbn;

    console.log(123, username, review, isbn);
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review; // Add or modify the review
    return res.status(200).json({ message: "Review added/modified successfully" });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.user; // Get username from token in middleware
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Delete the review
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
