import React, { useEffect, useState } from "react";

function TeacherView() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/records")
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.error("資料載入錯誤:", err));
  }, []);

  // 狀態顏色
  const getStatusColor = (status) => {
    if (status === "準時") return "green";
    if (status === "遲到") return "red";
    return "gray";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>老師端：簽到紀錄</h1>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>學號</th>
            <th>姓名</th>
            <th>簽到時間</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.studentId}</td>
              <td>{rec.name}</td>
              <td>{rec.timestamp}</td>
              <td style={{ color: getStatusColor(rec.status), fontWeight: "bold" }}>
                {rec.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherView;
