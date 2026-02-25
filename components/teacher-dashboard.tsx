"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  BookOpen,
  Microscope,
  Monitor,
  Download,
  Users,
  TrendingUp,
  Award,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react"

interface StudentProgress {
  id: string
  name: string
  email: string
  level: number
  totalXP: number
  streak: number
  accuracy: number
  completedChapters: number
  totalChapters: number
  lastActive: string
  subjectProgress: {
    history: number
    science: number
    computer: number
  }
  badges: number
  timeSpent: number // in minutes
}

interface DashboardStats {
  totalStudents: number
  averageAccuracy: number
  averageProgress: number
  totalXPEarned: number
  topicEngagement: Array<{ name: string; students: number; completion: number }>
  timeSeriesData: Array<{ date: string; active: number; xpEarned: number }>
  accuracyDistribution: Array<{ range: string; count: number; percentage: number }>
}

interface TeacherDashboardProps {
  onBack: () => void
  onExport: (format: "csv" | "pdf") => void
}

export function TeacherDashboard({ onBack, onExport }: TeacherDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null)
  const [viewMode, setViewMode] = useState<"overview" | "student-detail" | "analytics">("overview")
  const [sortBy, setSortBy] = useState<"name" | "progress" | "xp" | "accuracy">("progress")

  // Sample data
  const students: StudentProgress[] = [
    {
      id: "1",
      name: "Amina Kipchoge",
      email: "amina.kipchoge@school.ke",
      level: 18,
      totalXP: 5200,
      streak: 12,
      accuracy: 92,
      completedChapters: 9,
      totalChapters: 24,
      lastActive: "2 hours ago",
      subjectProgress: { history: 85, science: 75, computer: 95 },
      badges: 22,
      timeSpent: 845,
    },
    {
      id: "2",
      name: "David Kariuki",
      email: "david.kariuki@school.ke",
      level: 15,
      totalXP: 4100,
      streak: 8,
      accuracy: 78,
      completedChapters: 7,
      totalChapters: 24,
      lastActive: "5 days ago",
      subjectProgress: { history: 70, science: 60, computer: 75 },
      badges: 15,
      timeSpent: 620,
    },
    {
      id: "3",
      name: "Priya Patel",
      email: "priya.patel@school.ke",
      level: 20,
      totalXP: 6500,
      streak: 15,
      accuracy: 95,
      completedChapters: 11,
      totalChapters: 24,
      lastActive: "1 hour ago",
      subjectProgress: { history: 92, science: 88, computer: 98 },
      badges: 26,
      timeSpent: 1200,
    },
    {
      id: "4",
      name: "James Mutua",
      email: "james.mutua@school.ke",
      level: 12,
      totalXP: 2800,
      streak: 3,
      accuracy: 65,
      completedChapters: 5,
      totalChapters: 24,
      lastActive: "2 days ago",
      subjectProgress: { history: 55, science: 65, computer: 60 },
      badges: 8,
      timeSpent: 420,
    },
    {
      id: "5",
      name: "Grace Ochieng",
      email: "grace.ochieng@school.ke",
      level: 16,
      totalXP: 4500,
      streak: 10,
      accuracy: 86,
      completedChapters: 8,
      totalChapters: 24,
      lastActive: "Today",
      subjectProgress: { history: 80, science: 82, computer: 85 },
      badges: 18,
      timeSpent: 720,
    },
  ]

  const dashboardStats: DashboardStats = {
    totalStudents: students.length,
    averageAccuracy: Math.round(students.reduce((sum, s) => sum + s.accuracy, 0) / students.length),
    averageProgress: Math.round(
      students.reduce((sum, s) => sum + (s.completedChapters / s.totalChapters) * 100, 0) / students.length,
    ),
    totalXPEarned: students.reduce((sum, s) => sum + s.totalXP, 0),
    topicEngagement: [
      { name: "History Quest", students: 5, completion: 78 },
      { name: "Science Explorer", students: 5, completion: 72 },
      { name: "Digital Pioneer", students: 5, completion: 85 },
    ],
    timeSeriesData: [
      { date: "Mon", active: 5, xpEarned: 450 },
      { date: "Tue", active: 4, xpEarned: 380 },
      { date: "Wed", active: 5, xpEarned: 520 },
      { date: "Thu", active: 3, xpEarned: 280 },
      { date: "Fri", active: 5, xpEarned: 610 },
      { date: "Sat", active: 2, xpEarned: 180 },
      { date: "Sun", active: 4, xpEarned: 390 },
    ],
    accuracyDistribution: [
      { range: "90-100%", count: 2, percentage: 40 },
      { range: "80-89%", count: 2, percentage: 40 },
      { range: "70-79%", count: 1, percentage: 20 },
    ],
  }

  const sortedStudents = [...students].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "progress":
        return (b.completedChapters / b.totalChapters) - (a.completedChapters / a.totalChapters)
      case "xp":
        return b.totalXP - a.totalXP
      case "accuracy":
        return b.accuracy - a.accuracy
      default:
        return 0
    }
  })

  const OverviewView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Students</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.totalStudents}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Accuracy</span>
            <Target className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.averageAccuracy}%</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Progress</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.averageProgress}%</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total XP</span>
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.totalXPEarned}</div>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardStats.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="xpEarned" fill="var(--primary)" name="XP Earned" />
            <Bar dataKey="active" fill="var(--accent)" name="Students Active" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Subject Engagement */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Subject Engagement</h3>
        <div className="space-y-4">
          {dashboardStats.topicEngagement.map((topic) => (
            <div key={topic.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{topic.name}</span>
                <Badge variant="secondary">{topic.completion}%</Badge>
              </div>
              <Progress value={topic.completion} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Accuracy Distribution */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Accuracy Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dashboardStats.accuracyDistribution}
              dataKey="count"
              nameKey="range"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              <Cell fill="var(--primary)" />
              <Cell fill="var(--accent)" />
              <Cell fill="var(--destructive)" />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {dashboardStats.accuracyDistribution.map((item) => (
            <div key={item.range} className="flex justify-between text-sm">
              <span>{item.range}</span>
              <span className="font-semibold">{item.count} students</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const StudentListView = () => (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex gap-2 flex-wrap">
        {(["name", "progress", "xp", "accuracy"] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={sortBy === option ? "default" : "outline"}
            onClick={() => setSortBy(option)}
            className="capitalize"
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Student Cards */}
      {sortedStudents.map((student) => (
        <Card
          key={student.id}
          className="p-4 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => {
            setSelectedStudent(student)
            setViewMode("student-detail")
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold">{student.name}</h4>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">Level {student.level}</div>
              <Badge variant="secondary">{student.accuracy}% Accuracy</Badge>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {student.completedChapters}/{student.totalChapters} chapters
              </span>
            </div>
            <Progress
              value={(student.completedChapters / student.totalChapters) * 100}
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-primary/10 p-2 rounded text-center">
              <div className="font-semibold">{student.totalXP}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
            <div className="bg-accent/10 p-2 rounded text-center">
              <div className="font-semibold">{student.streak}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
            <div className="bg-yellow-100/50 dark:bg-yellow-900/20 p-2 rounded text-center">
              <div className="font-semibold">{student.badges}</div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
          </div>

          {student.lastActive === "2 days ago" || student.lastActive === "5 days ago" ? (
            <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="w-4 h-4" />
              <span>Inactive for {student.lastActive}</span>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  )

  const StudentDetailView = () => (
    <div className="space-y-6">
      {selectedStudent && (
        <>
          {/* Back Button */}
          <Button variant="ghost" onClick={() => setViewMode("overview")} className="gap-2">
            ← Back to List
          </Button>

          {/* Student Header */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                <p className="text-muted-foreground">{selectedStudent.email}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">Level {selectedStudent.level}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Accuracy Rate</div>
                <div className="text-2xl font-bold">{selectedStudent.accuracy}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Time Spent</div>
                <div className="text-2xl font-bold">{Math.round(selectedStudent.timeSpent / 60)}h</div>
              </div>
            </div>
          </Card>

          {/* Subject Progress */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Subject Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-4 h-4 text-history" />
                  <span className="font-medium">History Quest</span>
                  <Badge>{selectedStudent.subjectProgress.history}%</Badge>
                </div>
                <Progress value={selectedStudent.subjectProgress.history} className="h-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Microscope className="w-4 h-4 text-science" />
                  <span className="font-medium">Science Explorer</span>
                  <Badge>{selectedStudent.subjectProgress.science}%</Badge>
                </div>
                <Progress value={selectedStudent.subjectProgress.science} className="h-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Monitor className="w-4 h-4 text-computer" />
                  <span className="font-medium">Digital Pioneer</span>
                  <Badge>{selectedStudent.subjectProgress.computer}%</Badge>
                </div>
                <Progress value={selectedStudent.subjectProgress.computer} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="text-2xl font-bold">{selectedStudent.streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg text-center">
                <div className="text-2xl font-bold">{selectedStudent.badges}</div>
                <div className="text-sm text-muted-foreground">Badges</div>
              </div>
              <div className="p-3 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold">{selectedStudent.totalXP}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
              <div className="p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold">{selectedStudent.lastActive}</div>
                <div className="text-sm text-muted-foreground">Last Active</div>
              </div>
            </div>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Performance Insights</h3>
            {selectedStudent.accuracy >= 85 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300 mb-3">
                <strong>Strength:</strong> Excellent accuracy rate. Student demonstrates strong comprehension.
              </div>
            )}
            {selectedStudent.streak < 5 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Attention Needed:</strong> Low engagement streak. Consider sending encouragement.
              </div>
            )}
            {Math.abs(selectedStudent.subjectProgress.history - selectedStudent.subjectProgress.science) > 15 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <strong>Observation:</strong> Performance varies across subjects. May need targeted support in weaker areas.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Track student progress and engagement</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("csv")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("pdf")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        {(["overview", "student-detail", "analytics"] as const).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "outline"}
            onClick={() => setViewMode(mode)}
            className="capitalize"
          >
            {mode === "student-detail" ? "Students" : mode}
          </Button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "overview" && <OverviewView />}
      {viewMode === "student-detail" && !selectedStudent && <StudentListView />}
      {viewMode === "student-detail" && selectedStudent && <StudentDetailView />}
      {viewMode === "analytics" && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
          <p className="text-muted-foreground mb-4">
            Detailed analytics features including performance trends, skill assessments, and predictive insights would be displayed here. Teachers can filter by subject, time period, and performance metrics to identify trends and areas needing intervention.
          </p>
        </Card>
      )}
    </div>
  )
}
