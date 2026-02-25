"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Microscope, Monitor, Trophy, Star, Play, Settings, User, Zap } from "lucide-react"
import { SubjectWorld } from "@/components/subject-world"
import { ChapterLesson } from "@/components/chapter-lesson"
import { TeacherDashboard } from "@/components/teacher-dashboard"
import { OfflineStatus, OfflineIndicator } from "@/components/offline-status"

export default function EduQuestHome() {
  const [currentView, setCurrentView] = useState<"menu" | "subjects" | "profile" | "subject-world" | "chapter-lesson" | "teacher-dashboard">(
    "menu",
  )
  const [selectedSubject, setSelectedSubject] = useState<"history" | "science" | "computer" | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [playerData] = useState({
    name: "Student Explorer",
    level: 12,
    xp: 2450,
    streak: 7,
    totalBadges: 15,
  })

  const subjects = [
    {
      id: "history" as const,
      name: "History Quest",
      description: "Journey through Kenya's rich heritage",
      icon: BookOpen,
      color: "history",
      progress: 65,
      chapters: 8,
      completedChapters: 5,
      bgPattern: "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",
    },
    {
      id: "science" as const,
      name: "Science Explorer",
      description: "Discover the wonders of natural science",
      icon: Microscope,
      color: "science",
      progress: 42,
      chapters: 10,
      completedChapters: 4,
      bgPattern: "bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20",
    },
    {
      id: "computer" as const,
      name: "Digital Pioneer",
      description: "Master computer literacy skills",
      icon: Monitor,
      color: "computer",
      progress: 78,
      chapters: 6,
      completedChapters: 5,
      bgPattern: "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20",
    },
  ]

  const handleSubjectSelect = (subjectId: "history" | "science" | "computer") => {
    setSelectedSubject(subjectId)
    setCurrentView("subject-world")
  }

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapter(chapterId)
    setCurrentView("chapter-lesson")
  }

  const handleChapterComplete = () => {
    setCurrentView("subject-world")
    // In a real app, this would update progress in the database
  }

  const MainMenu = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/20 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 animate-float">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-balance mb-2">EduQuest</h1>
          <p className="text-muted-foreground text-balance">Learn Through Adventure</p>
        </div>

        {/* Player Stats */}
        <Card className="p-4 mb-6 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{playerData.name}</h3>
              <p className="text-sm text-muted-foreground">Level {playerData.level}</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {playerData.streak} day streak
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>{playerData.xp}/3000</span>
            </div>
            <Progress value={(playerData.xp / 3000) * 100} className="h-2" />
          </div>
        </Card>

        {/* Main Actions */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={() => setCurrentView("subjects")}
            className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90 animate-pulse-glow"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Learning
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => setCurrentView("profile")} className="h-14 flex-col gap-1">
              <Trophy className="w-5 h-5" />
              <span className="text-sm">Progress</span>
            </Button>
            <Button variant="outline" onClick={() => setCurrentView("teacher-dashboard")} className="h-14 flex-col gap-1">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Teacher View</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{playerData.totalBadges}</div>
            <div className="text-xs text-muted-foreground">Badges</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-accent">17</div>
            <div className="text-xs text-muted-foreground">Chapters</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-science">89%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  )

  const SubjectSelection = () => (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pt-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView("menu")} className="p-2">
          ←
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Choose Your Quest</h1>
          <p className="text-muted-foreground">Select a subject to explore</p>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const Icon = subject.icon
          return (
            <Card
              key={subject.id}
              className={`p-4 cursor-pointer hover:shadow-lg transition-all ${subject.bgPattern}`}
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${subject.color}/20`}>
                  <Icon className={`w-6 h-6 text-${subject.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 text-balance">{subject.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {subject.completedChapters}/{subject.chapters} chapters
                      </span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {subject.progress}% Complete
                    </Badge>
                    <Button size="sm" className="h-8">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <Card className="p-2 bg-card/90 backdrop-blur-sm">
          <div className="flex justify-around">
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-12">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Learn</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-12">
              <Trophy className="w-4 h-4" />
              <span className="text-xs">Achievements</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-12">
              <User className="w-4 h-4" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const ProfileView = () => (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6 pt-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView("menu")} className="p-2">
          ←
        </Button>
        <h1 className="text-2xl font-bold">Your Progress</h1>
      </div>

      <Card className="p-6 mb-6 text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">{playerData.name}</h2>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>Level {playerData.level}</span>
          <span>•</span>
          <span>{playerData.xp} XP</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{playerData.streak}</div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">{playerData.totalBadges}</div>
          <div className="text-sm text-muted-foreground">Badges Earned</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Subject Progress</h3>
        <div className="space-y-4">
          {subjects.map((subject) => {
            const Icon = subject.icon
            return (
              <div key={subject.id} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 text-${subject.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{subject.name}</span>
                    <span>{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )

  const handleTeacherExport = (format: "csv" | "pdf") => {
    console.log(`[v0] Exporting data as ${format}`)
    // In production, this would trigger actual export functionality
    alert(`Export as ${format.toUpperCase()} - Feature coming soon!`)
  }

  return (
    <>
      {currentView === "menu" && <MainMenu />}
      {currentView === "subjects" && <SubjectSelection />}
      {currentView === "profile" && <ProfileView />}
      {currentView === "teacher-dashboard" && (
        <TeacherDashboard
          onBack={() => setCurrentView("menu")}
          onExport={handleTeacherExport}
        />
      )}
      {currentView === "subject-world" && selectedSubject && (
        <SubjectWorld
          subjectId={selectedSubject}
          onBack={() => setCurrentView("subjects")}
          onChapterSelect={handleChapterSelect}
        />
      )}
      {currentView === "chapter-lesson" && selectedSubject && selectedChapter && (
        <ChapterLesson
          subjectId={selectedSubject}
          chapterId={selectedChapter}
          onBack={() => setCurrentView("subject-world")}
          onComplete={handleChapterComplete}
        />
      )}
      <OfflineIndicator />
    </>
  )
}
