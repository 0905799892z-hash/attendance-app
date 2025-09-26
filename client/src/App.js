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

// ======== 上課時間設定 ========
// 第一節 08:10，第二節 09:10，以此類推
const classTimes = [
  "08:10",
  "09:10",
  "10:10",
  "11:10",
  "13:10",
  "14:10",
  "15:10",
];

// ======== 判斷是否遲到 ========
function getStatus() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let classTime of classTimes) {
    const [h, m] = classTime.split(":").map(Number);
    const classMinutes = h * 60 + m;

    // 如果現在時間在課程開始 ±60 分鐘內，就比對是否遲到
    if (currentMinutes >= classMinutes && currentMinutes <= classMinutes + 60) {
      if (currentMinutes > classMinutes + 20) {
        return "遲到";
      } else {
        return "準時";
      }
    }
  }
  return "非上課時間";
}

// ======== 簽到 API ========
app.post("/checkin", (req, res) => {
  const { studentId, name } = req.body;
  const status = getStatus();

  db.run(
    `INSERT INTO attendance (studentId, name, status) VALUES (?, ?, ?)`,
    [studentId, name, status],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "資料庫錯誤" });
      }
      res.json({ message: `${name} (${studentId}) 簽到成功，狀態：${status}` });
    }
  );
});

// ======== 查詢紀錄 API ========
app.get("/records", (req, res) => {
  db.all(`SELECT * FROM attendance`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "資料庫錯誤" });
    }
    res.json(rows);
  });
});

// 啟動伺服器
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
