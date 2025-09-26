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

// 測試 API
app.get("/", (req, res) => {
  res.send("✅ Attendance API is running!");
});

// 範例：查詢資料表 (要確保 DB 有 table)
app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
