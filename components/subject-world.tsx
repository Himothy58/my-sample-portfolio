"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Microscope, Monitor, Star, Lock, CheckCircle, Play, Trophy, Clock, Target } from "lucide-react"

interface Chapter {
  id: string
  title: string
  description: string
  isUnlocked: boolean
  isCompleted: boolean
  progress: number
  estimatedTime: string
  xpReward: number
  topics: string[]
}

interface SubjectWorldProps {
  subjectId: "history" | "science" | "computer"
  onBack: () => void
  onChapterSelect: (chapterId: string) => void
}

export function SubjectWorld({ subjectId, onBack, onChapterSelect }: SubjectWorldProps) {
  const subjectData = {
    history: {
      name: "History Quest",
      description: "Journey through Kenya's rich heritage and independence struggles",
      icon: BookOpen,
      color: "history",
      bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50",
      chapters: [
        {
          id: "h1",
          title: "Early Settlements",
          description: "Discover Kenya's earliest inhabitants and their way of life",
          isUnlocked: true,
          isCompleted: true,
          progress: 100,
          estimatedTime: "15 min",
          xpReward: 150,
          topics: ["Bantu Migration", "Cushitic Peoples", "Nilotic Communities"],
        },
        {
          id: "h2",
          title: "Trade Routes",
          description: "Explore ancient trade networks along the East African coast",
          isUnlocked: true,
          isCompleted: true,
          progress: 100,
          estimatedTime: "20 min",
          xpReward: 200,
          topics: ["Swahili Coast", "Arab Traders", "Indian Ocean Trade"],
        },
        {
          id: "h3",
          title: "Colonial Period",
          description: "Understanding the impact of European colonization",
          isUnlocked: true,
          isCompleted: false,
          progress: 65,
          estimatedTime: "25 min",
          xpReward: 250,
          topics: ["British Rule", "Railway Construction", "Settler Economy"],
        },
        {
          id: "h4",
          title: "Independence Struggle",
          description: "Heroes and movements that led to Kenya's freedom",
          isUnlocked: true,
          isCompleted: false,
          progress: 0,
          estimatedTime: "30 min",
          xpReward: 300,
          topics: ["Mau Mau", "Jomo Kenyatta", "Uhuru"],
        },
        {
          id: "h5",
          title: "Modern Kenya",
          description: "Kenya's journey since independence",
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
          estimatedTime: "20 min",
          xpReward: 200,
          topics: ["Post-Independence", "Economic Development", "Democracy"],
        },
      ] as Chapter[],
    },
    science: {
      name: "Science Explorer",
      description: "Discover the wonders of natural science through experiments",
      icon: Microscope,
      color: "science",
      bgGradient: "bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50",
      chapters: [
        {
          id: "s1",
          title: "Living Things",
          description: "Explore the characteristics of living organisms",
          isUnlocked: true,
          isCompleted: true,
          progress: 100,
          estimatedTime: "18 min",
          xpReward: 180,
          topics: ["Cell Structure", "Life Processes", "Classification"],
        },
        {
          id: "s2",
          title: "Human Body",
          description: "Journey through body systems and their functions",
          isUnlocked: true,
          isCompleted: false,
          progress: 40,
          estimatedTime: "25 min",
          xpReward: 250,
          topics: ["Digestive System", "Respiratory System", "Circulatory System"],
        },
        {
          id: "s3",
          title: "Plants & Animals",
          description: "Understand ecosystems and biodiversity",
          isUnlocked: true,
          isCompleted: false,
          progress: 0,
          estimatedTime: "22 min",
          xpReward: 220,
          topics: ["Photosynthesis", "Food Chains", "Habitats"],
        },
        {
          id: "s4",
          title: "Matter & Energy",
          description: "Discover the building blocks of our universe",
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
          estimatedTime: "28 min",
          xpReward: 280,
          topics: ["States of Matter", "Energy Forms", "Chemical Changes"],
        },
      ] as Chapter[],
    },
    computer: {
      name: "Digital Pioneer",
      description: "Master computer literacy and digital citizenship",
      icon: Monitor,
      color: "computer",
      bgGradient: "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50",
      chapters: [
        {
          id: "c1",
          title: "Computer Basics",
          description: "Learn about computer parts and how they work",
          isUnlocked: true,
          isCompleted: true,
          progress: 100,
          estimatedTime: "15 min",
          xpReward: 150,
          topics: ["Hardware", "Software", "Input/Output"],
        },
        {
          id: "c2",
          title: "Internet Safety",
          description: "Stay safe while exploring the digital world",
          isUnlocked: true,
          isCompleted: true,
          progress: 100,
          estimatedTime: "20 min",
          xpReward: 200,
          topics: ["Online Safety", "Privacy", "Digital Footprint"],
        },
        {
          id: "c3",
          title: "Digital Communication",
          description: "Communicate effectively in the digital age",
          isUnlocked: true,
          isCompleted: false,
          progress: 75,
          estimatedTime: "18 min",
          xpReward: 180,
          topics: ["Email", "Social Media", "Digital Etiquette"],
        },
        {
          id: "c4",
          title: "Basic Programming",
          description: "Introduction to coding and logical thinking",
          isUnlocked: true,
          isCompleted: false,
          progress: 0,
          estimatedTime: "35 min",
          xpReward: 350,
          topics: ["Algorithms", "Scratch Programming", "Problem Solving"],
        },
      ] as Chapter[],
    },
  }

  const subject = subjectData[subjectId]
  const Icon = subject.icon

  const completedChapters = subject.chapters.filter((ch) => ch.isCompleted).length
  const totalProgress = Math.round(subject.chapters.reduce((sum, ch) => sum + ch.progress, 0) / subject.chapters.length)

  return (
    <div className={`min-h-screen ${subject.bgGradient} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-accent/20 rounded-full blur-lg" />
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 bg-white/80 dark:bg-black/80">
            ←
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-${subject.color}/20 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${subject.color}`} />
              </div>
              <h1 className="text-2xl font-bold">{subject.name}</h1>
            </div>
            <p className="text-muted-foreground text-balance">{subject.description}</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="p-4 mb-6 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Overall Progress</h3>
            <Badge variant="secondary">
              {completedChapters}/{subject.chapters.length} chapters
            </Badge>
          </div>
          <Progress value={totalProgress} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalProgress}% Complete</span>
            <span>{subject.chapters.reduce((sum, ch) => sum + ch.xpReward, 0)} XP Total</span>
          </div>
        </Card>

        {/* Chapter List */}
        <div className="space-y-4 mb-20">
          {subject.chapters.map((chapter, index) => (
            <Card
              key={chapter.id}
              className={`p-4 transition-all ${
                chapter.isUnlocked
                  ? "cursor-pointer hover:shadow-lg bg-white/90 dark:bg-black/90"
                  : "opacity-60 bg-white/60 dark:bg-black/60"
              } backdrop-blur-sm`}
              onClick={() => chapter.isUnlocked && onChapterSelect(chapter.id)}
            >
              <div className="flex items-start gap-4">
                {/* Chapter Number & Status */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      chapter.isCompleted
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : chapter.isUnlocked
                          ? `bg-${subject.color}/20 text-${subject.color}`
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {chapter.isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : chapter.isUnlocked ? (
                      index + 1
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Chapter Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{chapter.title}</h3>
                    {chapter.isUnlocked && (
                      <Button size="sm" variant={chapter.progress > 0 ? "default" : "outline"} className="ml-2">
                        {chapter.isCompleted ? (
                          <Trophy className="w-4 h-4" />
                        ) : chapter.progress > 0 ? (
                          "Continue"
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 text-balance">{chapter.description}</p>

                  {/* Progress Bar (if started) */}
                  {chapter.progress > 0 && !chapter.isCompleted && (
                    <div className="mb-3">
                      <Progress value={chapter.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{chapter.progress}% complete</p>
                    </div>
                  )}

                  {/* Chapter Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {chapter.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {chapter.xpReward} XP
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {chapter.topics.length} topics
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1">
                    {chapter.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {chapter.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{chapter.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
