"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Microscope,
  Monitor,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Trophy,
  Lightbulb,
  Target,
} from "lucide-react"
import { TimelineGame } from "./mini-games/timeline-game"
import { DragDropGame } from "./mini-games/drag-drop-game"
import { CodingPuzzle } from "./mini-games/coding-puzzle"

interface Lesson {
  id: string
  title: string
  type: "story" | "interactive" | "quiz" | "mini-game"
  content: string
  isCompleted: boolean
  xpReward: number
  gameType?: "timeline" | "drag-drop" | "coding"
}

interface ChapterLessonProps {
  subjectId: "history" | "science" | "computer"
  chapterId: string
  onBack: () => void
  onComplete: () => void
}

export function ChapterLesson({ subjectId, chapterId, onBack, onComplete }: ChapterLessonProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [lessonProgress, setLessonProgress] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showMiniGame, setShowMiniGame] = useState(false)

  // Sample chapter data with mini-games
  const chapterData = {
    history: {
      h3: {
        title: "Colonial Period",
        description: "Understanding the impact of European colonization on Kenya",
        lessons: [
          {
            id: "h3-1",
            title: "The Arrival of Europeans",
            type: "story" as const,
            content:
              "In the late 19th century, European explorers and missionaries began arriving on the East African coast. The British were particularly interested in controlling trade routes to India...",
            isCompleted: false,
            xpReward: 50,
          },
          {
            id: "h3-2",
            title: "Building the Railway",
            type: "interactive" as const,
            content:
              "The Uganda Railway, also known as the 'Lunatic Express', was a massive engineering project that changed Kenya forever. Let's explore its impact...",
            isCompleted: false,
            xpReward: 75,
          },
          {
            id: "h3-3",
            title: "Colonial Impact Quiz",
            type: "quiz" as const,
            content: "Test your knowledge about the colonial period in Kenya.",
            isCompleted: false,
            xpReward: 100,
          },
          {
            id: "h3-4",
            title: "Timeline Challenge",
            type: "mini-game" as const,
            content: "Arrange the colonial events in the correct chronological order.",
            isCompleted: false,
            xpReward: 125,
            gameType: "timeline" as const,
          },
        ],
      },
    },
    science: {
      s2: {
        title: "Human Body",
        description: "Journey through body systems and their functions",
        lessons: [
          {
            id: "s2-1",
            title: "The Amazing Digestive System",
            type: "story" as const,
            content:
              "Your body is like a complex machine that needs fuel to run. The digestive system is responsible for breaking down food and absorbing nutrients...",
            isCompleted: false,
            xpReward: 50,
          },
          {
            id: "s2-2",
            title: "Virtual Body Exploration",
            type: "interactive" as const,
            content: "Take a journey through the human body and discover how different organs work together.",
            isCompleted: false,
            xpReward: 75,
          },
          {
            id: "s2-3",
            title: "Body Systems Quiz",
            type: "quiz" as const,
            content: "Test your understanding of how body systems function.",
            isCompleted: false,
            xpReward: 100,
          },
          {
            id: "s2-4",
            title: "Organ Sorting Challenge",
            type: "mini-game" as const,
            content: "Sort organs into their correct body systems.",
            isCompleted: false,
            xpReward: 125,
            gameType: "drag-drop" as const,
          },
        ],
      },
    },
    computer: {
      c4: {
        title: "Basic Programming",
        description: "Introduction to coding and logical thinking",
        lessons: [
          {
            id: "c4-1",
            title: "What is Programming?",
            type: "story" as const,
            content:
              "Programming is like giving instructions to a computer. Just like you follow a recipe to cook, computers follow programs to complete tasks...",
            isCompleted: false,
            xpReward: 50,
          },
          {
            id: "c4-2",
            title: "Algorithm Adventure",
            type: "interactive" as const,
            content: "Learn to think step-by-step by creating algorithms for everyday tasks.",
            isCompleted: false,
            xpReward: 75,
          },
          {
            id: "c4-3",
            title: "Scratch Coding Challenge",
            type: "mini-game" as const,
            content: "Create your first program using visual blocks in Scratch.",
            isCompleted: false,
            xpReward: 150,
            gameType: "coding" as const,
          },
        ],
      },
    },
  }

  const currentChapter = chapterData[subjectId]?.[chapterId as keyof (typeof chapterData)[typeof subjectId]]
  const currentLesson = currentChapter?.lessons[currentLessonIndex]

  if (!currentChapter || !currentLesson) {
    return <div>Chapter not found</div>
  }

  const subjectConfig = {
    history: { icon: BookOpen, color: "history", name: "History Quest" },
    science: { icon: Microscope, color: "science", name: "Science Explorer" },
    computer: { icon: Monitor, color: "computer", name: "Digital Pioneer" },
  }

  const config = subjectConfig[subjectId]
  const Icon = config.icon

  const handleNext = () => {
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setLessonProgress(0)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setShowMiniGame(false)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
      setLessonProgress(0)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setShowMiniGame(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    setLessonProgress(100)
  }

  const handleMiniGameComplete = (score: number) => {
    setLessonProgress(100)
    setShowMiniGame(false)
  }

  // Mini-game data
  const getMiniGameData = () => {
    if (currentLesson.gameType === "timeline" && subjectId === "history") {
      return {
        events: [
          { id: "1", title: "Berlin Conference", year: "1884", description: "European powers divide Africa" },
          {
            id: "2",
            title: "IBEAC Established",
            year: "1888",
            description: "Imperial British East Africa Company formed",
          },
          { id: "3", title: "Uganda Railway Begins", year: "1896", description: "Construction of railway starts" },
          { id: "4", title: "East Africa Protectorate", year: "1895", description: "British establish protectorate" },
        ],
      }
    } else if (currentLesson.gameType === "drag-drop" && subjectId === "science") {
      return {
        items: [
          { id: "1", content: "Heart", category: "circulatory", description: "Pumps blood through the body" },
          { id: "2", content: "Lungs", category: "respiratory", description: "Exchange oxygen and carbon dioxide" },
          { id: "3", content: "Stomach", category: "digestive", description: "Breaks down food with acid" },
          { id: "4", content: "Brain", category: "nervous", description: "Controls body functions" },
          { id: "5", content: "Liver", category: "digestive", description: "Processes nutrients and toxins" },
          { id: "6", content: "Kidneys", category: "excretory", description: "Filter waste from blood" },
        ],
        categories: [
          {
            id: "circulatory",
            name: "Circulatory System",
            description: "Transports blood and nutrients",
            color: "red-500",
          },
          {
            id: "respiratory",
            name: "Respiratory System",
            description: "Handles breathing and gas exchange",
            color: "blue-500",
          },
          {
            id: "digestive",
            name: "Digestive System",
            description: "Breaks down and absorbs food",
            color: "green-500",
          },
          { id: "nervous", name: "Nervous System", description: "Controls and coordinates body", color: "purple-500" },
          { id: "excretory", name: "Excretory System", description: "Removes waste from body", color: "yellow-500" },
        ],
      }
    } else if (currentLesson.gameType === "coding" && subjectId === "computer") {
      return {
        codeBlocks: [
          { id: "1", code: "print('Hello, World!')", description: "Display a message" },
          { id: "2", code: "name = input('What is your name? ')", description: "Get user input" },
          { id: "3", code: "print('Nice to meet you, ' + name)", description: "Display personalized message" },
        ],
        correctOrder: ["2", "1", "3"],
        expectedOutput: "What is your name? \nHello, World!\nNice to meet you, Student",
      }
    }
    return null
  }

  // Show mini-game if it's a mini-game lesson and showMiniGame is true
  if (currentLesson.type === "mini-game" && showMiniGame) {
    const gameData = getMiniGameData()

    if (currentLesson.gameType === "timeline" && gameData) {
      return (
        <TimelineGame
          events={gameData.events}
          onComplete={handleMiniGameComplete}
          onBack={() => setShowMiniGame(false)}
        />
      )
    } else if (currentLesson.gameType === "drag-drop" && gameData) {
      return (
        <DragDropGame
          items={gameData.items}
          categories={gameData.categories}
          title="Body Systems Challenge"
          onComplete={handleMiniGameComplete}
          onBack={() => setShowMiniGame(false)}
        />
      )
    } else if (currentLesson.gameType === "coding" && gameData) {
      return (
        <CodingPuzzle
          title="First Program"
          description="Create a simple program that greets the user"
          codeBlocks={gameData.codeBlocks}
          correctOrder={gameData.correctOrder}
          expectedOutput={gameData.expectedOutput}
          onComplete={handleMiniGameComplete}
          onBack={() => setShowMiniGame(false)}
        />
      )
    }
  }

  const renderLessonContent = () => {
    switch (currentLesson.type) {
      case "story":
        return (
          <div className="space-y-6">
            {/* Story Content */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Story Time</h3>
              </div>
              <p className="text-foreground leading-relaxed text-balance">{currentLesson.content}</p>
            </Card>

            {/* Interactive Elements */}
            <div className="flex justify-center">
              <Button onClick={() => setLessonProgress(100)} disabled={lessonProgress === 100} className="gap-2">
                {lessonProgress === 100 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Story Complete
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Mark as Read
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case "interactive":
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">Interactive Learning</h3>
              </div>
              <p className="text-foreground leading-relaxed mb-4 text-balance">{currentLesson.content}</p>

              {/* Interactive simulation placeholder */}
              <div className="bg-muted/50 rounded-lg p-8 text-center border-2 border-dashed border-muted-foreground/20">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Interactive simulation would load here</p>
                <Button className="mt-4" onClick={() => setLessonProgress(100)} disabled={lessonProgress === 100}>
                  {lessonProgress === 100 ? "Completed" : "Start Activity"}
                </Button>
              </div>
            </Card>
          </div>
        )

      case "quiz":
        const quizQuestions = [
          {
            question: "When did the British establish colonial rule in Kenya?",
            options: ["1885", "1895", "1905", "1915"],
            correct: "1895",
            explanation: "The British established the East Africa Protectorate in 1895.",
          },
        ]

        const currentQuestion = quizQuestions[0]

        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Knowledge Check</h3>
              </div>

              <h4 className="text-lg font-medium mb-4 text-balance">{currentQuestion.question}</h4>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {showFeedback && (
                <Card
                  className={`mt-4 p-4 ${selectedAnswer === currentQuestion.correct ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle
                      className={`w-5 h-5 ${selectedAnswer === currentQuestion.correct ? "text-green-600" : "text-red-600"}`}
                    />
                    <span className="font-semibold">
                      {selectedAnswer === currentQuestion.correct ? "Correct!" : "Not quite right"}
                    </span>
                  </div>
                  <p className="text-sm text-balance">{currentQuestion.explanation}</p>
                </Card>
              )}
            </Card>
          </div>
        )

      case "mini-game":
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Mini-Game Challenge</h3>
              </div>
              <p className="text-foreground leading-relaxed mb-4 text-balance">{currentLesson.content}</p>

              {/* Mini-game launch */}
              <div className="bg-muted/50 rounded-lg p-8 text-center border-2 border-dashed border-muted-foreground/20">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Ready to test your skills?</p>
                <Button className="mt-4" onClick={() => setShowMiniGame(true)} disabled={lessonProgress === 100}>
                  {lessonProgress === 100 ? "Game Completed" : "Start Game"}
                </Button>
              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          ←
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 text-${config.color}`} />
            <h1 className="text-xl font-bold">{currentChapter.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{currentLesson.title}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Lesson Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentLessonIndex + 1}/{currentChapter.lessons.length}
          </span>
        </div>
        <Progress value={(currentLessonIndex / currentChapter.lessons.length) * 100} className="h-2 mb-2" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Current Lesson: {lessonProgress}%</span>
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            {currentLesson.xpReward} XP
          </Badge>
        </div>
      </Card>

      {/* Lesson Content */}
      <div className="mb-6">{renderLessonContent()}</div>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-4 pb-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentLessonIndex === 0}
          className="gap-2 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentChapter.lessons.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentLessonIndex ? "bg-primary" : index < currentLessonIndex ? "bg-green-500" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button onClick={handleNext} disabled={lessonProgress < 100} className="gap-2">
          {currentLessonIndex === currentChapter.lessons.length - 1 ? "Complete" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
