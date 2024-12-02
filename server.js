require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to database");
});

app.get("/notes", (req, res) => {
  const query = "SELECT * FROM notes";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/notes/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM notes WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ error: "Note not found" });
    res.json(result[0]);
  });
});

app.post("/notes", (req, res) => {
  const { title, datetime, note } = req.body;
  const query = "INSERT INTO notes (title, datetime, note) VALUES (?, ?, ?)";
  db.query(query, [title, datetime, note], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Note created", id: result.insertId });
  });
});

app.put("/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, datetime, note } = req.body;
  const query =
    "UPDATE notes SET title = ?, datetime = ?, note = ? WHERE id = ?";
  db.query(query, [title, datetime, note, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Note updated" });
  });
});

app.delete("/notes/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM notes WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Note deleted" });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
