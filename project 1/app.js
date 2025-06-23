const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');  // Keep only one instance of mongoose
const localtunnel = require('localtunnel');


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL for Gmail
  auth: {
      user: 'm.abdullahali375@gmail.com',      
      pass: 'edkamfpfhgrtlyaa'  // Make sure this is stored securely
  }
});

// Mongoose schema and model for Feedback
const feedbackSchema = new mongoose.Schema({
  name: String,
  occupation: String,
  message: String,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/feedbackDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get('/services', (req, res) => {
  res.render('service'); 
});

// Route for the feedback page
app.get('/feedback', async (req, res) => {
  const feedbackList = await Feedback.find(); // Fetch feedback entries from the database
  res.render('feedback', { feedbackList }); // Pass to EJS template
});

app.get('/submit-feedback', (req, res) => {
  res.render('submit-feedback'); // Render the feedback submission page
});

// Route to handle form submission
app.post('/feedback', async (req, res) => {
  const { name, occupation, message } = req.body;

  // Save the feedback to the database
  const newFeedback = new Feedback({ name, occupation, message });
  await newFeedback.save();

  res.redirect('/feedback'); // Redirect back to the main feedback page
});

app.get('/about', (req, res) => {
  res.render('about'); 
});

// POST route for handling form submission
app.post('/about', (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: 'm.abdullahali375@gmail.com',  // Replace with your email
    subject: `New Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error sending email');
    }
    res.send('Email sent successfully');
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
