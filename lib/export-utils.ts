export async function exportToCSV(format: 'csv' | 'json' = 'csv') {
  try {
    const response = await fetch(`/api/teacher/export?format=${format}`)

    if (!response.ok) {
      throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eduquest-report-${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return true
  } catch (error) {
    console.error('Export error:', error)
    return false
  }
}

export function generatePDFReport(data: any) {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:hover { background-color: #f9f9f9; }
          .summary { display: flex; gap: 20px; margin-bottom: 20px; }
          .summary-card { flex: 1; padding: 15px; background: #f0f0f0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>EduQuest Analytics Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <div class="summary">
          <div class="summary-card">
            <h3>Total Students</h3>
            <p>${data.totalStudents || 0}</p>
          </div>
          <div class="summary-card">
            <h3>Average Accuracy</h3>
            <p>${data.avgAccuracy || 0}%</p>
          </div>
          <div class="summary-card">
            <h3>Average Progress</h3>
            <p>${data.avgProgress || 0}%</p>
          </div>
        </div>
        <h2>Student Details</h2>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Level</th>
              <th>Total XP</th>
              <th>Accuracy</th>
              <th>Lessons</th>
            </tr>
          </thead>
          <tbody>
            ${(data.students || [])
              .map(
                (student: any) => `
              <tr>
                <td>${student.name}</td>
                <td>${student.level}</td>
                <td>${student.totalXP}</td>
                <td>${student.accuracy}%</td>
                <td>${student.lessonsCompleted}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  return html
}
