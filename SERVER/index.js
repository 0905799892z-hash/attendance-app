const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// 啟用 CORS & JSON body parser
app.use(cors());
app.use(express.json());

// 連線到 SQLite
const db = new sqlite3.Database("./attendance.db", (err) => {
  if (err) {
    console.error("❌ 連線 SQLite 失敗:", err.message);
  } else {
    console.log("✅ 已連線 SQLite 資料庫");
  }
});

// 建立資料表（如果不存在）
db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT UNIQUE,
    name TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT,
    date TEXT,
    timestamp TEXT,
    status TEXT,
    ip TEXT,
    FOREIGN KEY (studentId) REFERENCES students(studentId)
  )
`);

// 測試 API
app.get("/", (req, res) => {
  res.send("✅ Attendance API is running!");
});

// 新增學生
app.post("/students", (req, res) => {
  const { studentId, name } = req.body;
  db.run(
    "INSERT INTO students (studentId, name) VALUES (?, ?)",
    [studentId, name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "學生新增成功" });
    }
  );
});

// 查詢所有學生
app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 簽到 API
app.post("/attendance", (req, res) => {
  const { studentId, name } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const timestamp = now.toISOString();

  // 假設上課時間早上 9 點
  const classStart = new Date(`${date}T09:00:00`);
  const status = now > classStart ? "遲到" : "出席";

  // 檢查學生是否存在
  db.get(
    "SELECT * FROM students WHERE studentId = ? AND name = ?",
    [studentId, name],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(400).json({ error: "查無此學生" });

      // 插入點名紀錄
      db.run(
        "INSERT INTO attendance (studentId, date, timestamp, status, ip) VALUES (?, ?, ?, ?, ?)",
        [studentId, date, timestamp, status, ip],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "簽到成功", status, ip });
        }
      );
    }
  );
});

// 查詢某一天的點名紀錄
app.get("/attendance", (req, res) => {
  const { date } = req.query;
  db.all("SELECT * FROM attendance WHERE date = ?", [date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
