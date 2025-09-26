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

// 確保 students table 存在
db.run(
  `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      student_id TEXT NOT NULL UNIQUE
  )`,
  (err) => {
    if (err) {
      console.error("❌ 建立 students table 失敗:", err.message);
    } else {
      console.log("✅ students table 已確認存在");
    }
  }
);

// 測試 API
app.get("/", (req, res) => {
  res.send("✅ Attendance API is running!");
});

// 查詢所有學生
app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 新增學生
app.post("/students", (req, res) => {
  const { name, student_id } = req.body;
  if (!name || !student_id) {
    return res.status(400).json({ error: "缺少 name 或 student_id" });
  }

  db.run(
    "INSERT INTO students (name, student_id) VALUES (?, ?)",
    [name, student_id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, student_id });
      }
    }
  );
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
