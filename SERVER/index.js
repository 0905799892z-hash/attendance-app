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
    // 確保 students table 存在
    db.run(
      `CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("❌ 建立資料表失敗:", err.message);
        } else {
          console.log("✅ students table 已確認存在");
        }
      }
    );
  }
});

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
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  db.run("INSERT INTO students (name) VALUES (?)", [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      id: this.lastID, // 新增的學生 ID
      name,
    });
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
