const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 連線 SQLite
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

// 取得所有學生
app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新增學生（如果你要手動新增）
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
      res.json({ message: "學生新增成功", id: this.lastID });
    }
  );
});

// 簽到（自動新增學生）
app.post("/attendance", (req, res) => {
  const { studentId, name } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const timestamp = now.toISOString();
  const classStart = new Date(`${date}T09:00:00`);
  const status = now > classStart ? "遲到" : "出席";

  if (!studentId || !name) {
    return res.status(400).json({ error: "studentId 和 name 必填" });
  }

  // 先檢查學生是否存在
  db.get("SELECT * FROM students WHERE studentId = ?", [studentId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      // 如果學生不存在，就自動新增
      db.run("INSERT INTO students (studentId, name) VALUES (?, ?)", [studentId, name], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // 新增完再簽到
        addAttendance(studentId, date, timestamp, status, ip, res);
      });
    } else {
      // 學生存在，直接簽到
      addAttendance(studentId, date, timestamp, status, ip, res);
    }
  });
});

// 查詢某學生的簽到紀錄
app.get("/attendance/:studentId", (req, res) => {
  const { studentId } = req.params;
  db.all("SELECT * FROM attendance WHERE studentId = ?", [studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 共用的簽到函式
function addAttendance(studentId, date, timestamp, status, ip, res) {
  db.run(
    "INSERT INTO attendance (studentId, date, timestamp, status, ip) VALUES (?, ?, ?, ?, ?)",
    [studentId, date, timestamp, status, ip],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "簽到成功", status, ip });
    }
  );
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
