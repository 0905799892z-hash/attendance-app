import React, { useState, useEffect } from "react";

function App() {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState("student"); // student or teacher
  const [records, setRecords] = useState([]);

  // 學生簽到
  const handleCheckin = async () => {
    try {
      const res = await fetch("http://localhost:3000/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, name }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("伺服器錯誤，請稍後再試");
    }
  };

  // 老師端：載入出勤紀錄
  useEffect(() => {
    if (view === "teacher") {
      fetch("http://localhost:3000/records")
        .then((res) => res.json())
        .then((data) => setRecords(data))
        .catch((err) => console.error(err));
    }
  }, [view]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>線上點名系統</h1>

      {/* 切換按鈕 */}
      <button onClick={() => setView("student")}>切換到學生端</button>
      <button onClick={() => setView("teacher")}>切換到老師端</button>

      {view === "student" ? (
        <div>
          <input
            type="text"
            placeholder="學號"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <button onClick={handleCheckin}>簽到</button>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <h2>出勤紀錄</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>ID</th>
                <th>學號</th>
                <th>姓名</th>
                <th>時間</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.studentId}</td>
                  <td>{r.name}</td>
                  <td>{r.timestamp}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
