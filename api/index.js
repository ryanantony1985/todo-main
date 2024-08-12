const express = require('express');
const path = require('path'); // Import the path module
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("../models/TodoTask");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });

// Set the correct path for views
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Middleware for handling form data
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/static', express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
      if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
      }
  }
}));


// GET METHOD
app.get("/", async (req, res) => {
  try {
    const tasks = await TodoTask.find({});
    res.render("todo.ejs", { todoTasks: tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.render("todo.ejs", { todoTasks: [] });
  }
});

// UPDATE
app.route("/edit/:id")
  .get(async (req, res) => {
    const id = req.params.id;
    try {
      const tasks = await TodoTask.find({});
      res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
    } catch (err) {
      console.error("Error fetching tasks for edit:", err);
      res.redirect("/");
    }
  })
  .post(async (req, res) => {
    const id = req.params.id;
    try {
      await TodoTask.findByIdAndUpdate(id, { content: req.body.content });
      res.redirect("/");
    } catch (err) {
      console.error("Error updating task:", err);
      res.redirect("/");
    }
  });

// POST METHOD
app.post('/', async (req, res) => {
  const todoTask = new TodoTask({
    content: req.body.content
  });
  try {
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    res.redirect("/");
  }
});

// DELETE
app.get("/remove/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedTask = await TodoTask.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).send("Task not found");
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error removing task:", err);
    res.redirect("/");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Instead of starting the server, export the app for Vercel
module.exports = app;
