const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 建立資料庫
const db = new sqlite3.Database("./attendance.db");

// 建立表格
db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT,
    name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT
)`);

// 點名 API
app.post("/checkin", (req, res) => {
    const { studentId, name } = req.body;
    const now = new Date();
    const hour = now.getHours();
    let status = hour <= 9 ? "準時" : "遲到";

    db.run(
        `INSERT INTO attendance (studentId, name, status) VALUES (?, ?, ?)`,
        [studentId, name, status],
        function (err) {
            if (err) return res.status(500).send("Database error");
            res.json({ message: "點名成功", status });
        }
    );
});

// 查詢 API
app.get("/records", (req, res) => {
    db.all(`SELECT * FROM attendance`, [], (err, rows) => {
        if (err) return res.status(500).send("Database error");
        res.json(rows);
    });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
