const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const getBooks = async () => {
    try {
        const response = await axios.get('https://bulkinadivan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
    }
};

const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(`https://bulkinadivan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/${isbn}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching book by ISBN:', error);
    }
};

const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`https://bulkinadivan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai?author=${author}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching books by author:', error);
    }
};

const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`https://bulkinadivan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai?title=${title}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching books by title:', error);
    }
};

// In general.js
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists using the updated isValid function
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Save new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBooks();
  res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book, null, 2));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = Object.values(books).filter(book => book.author === author);
  res.send(JSON.stringify(result, null, 2));
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  res.send(JSON.stringify(result, null, 2));
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book.reviews, null, 2));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
