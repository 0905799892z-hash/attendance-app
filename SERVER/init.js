const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./attendance.db");

// 建立 students table (如果不存在)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL
    )
  `);

  console.log("✅ students table 建立成功！");
});

// 建立 attendance table (如果不存在)
db.serialize(() => {
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

  console.log("✅ attendance table 建立成功！");
});

db.close();
