const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./attendance.db");

db.serialize(() => {
  // 建立 students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL
    )
  `);
  console.log("✅ students table 建立成功！");

  // 建立 attendance table
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
