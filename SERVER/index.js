// index.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 連線資料庫
const db = new sqlite3.Database("./attendance.db", (err) => {
  if (err) {
    console.error("❌ 連線 SQLite 失敗:", err.message);
  } else {
    console.log("✅ 已連線 SQLite 資料庫");

    // 自動建立 students 和 attendance 資料表
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId TEXT NOT NULL,
          date TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL,
          ip TEXT
        )
      `);

      console.log("✅ 資料表 students & attendance 已建立/確認存在");
    });
  }
});

// 測試首頁 API
app.get("/", (req, res) => {
  res.send("✅ Attendance API is running!");
});

// 取得所有學生
app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新增學生
app.post("/students", (req, res) => {
  const { studentId, name } = req.body;
  if (!studentId || !name) {
    return res.status(400).json({ error: "studentId 和 name 必填" });
  }

  db.run(
    "INSERT INTO students (studentId, name) VALUES (?, ?)",
    [studentId, name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "✅ 學生新增成功", id: this.lastID });
    }
  );
});

// 學生簽到
app.post("/attendance", (req, res) => {
  const { studentId, name } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const timestamp = now.toISOString();
  const classStart = new Date(`${date}T09:00:00`);
  const status = now > classStart ? "遲到" : "出席";

  db.get(
    "SELECT * FROM students WHERE studentId = ? AND name = ?",
    [studentId, name],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(400).json({ error: "查無此學生" });

      db.run(
        "INSERT INTO attendance (studentId, date, timestamp, status, ip) VALUES (?, ?, ?, ?, ?)",
        [studentId, date, timestamp, status, ip],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "✅ 簽到成功", status, ip });
        }
      );
    }
  );
});

// 查詢某學生的簽到紀錄
app.get("/attendance/:studentId", (req, res) => {
  const { studentId } = req.params;
  db.all("SELECT * FROM attendance WHERE studentId = ?", [studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
