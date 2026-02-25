"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, RotateCcw, Trophy, Clock } from "lucide-react"

interface TimelineEvent {
  id: string
  title: string
  year: string
  description: string
}

interface TimelineGameProps {
  events: TimelineEvent[]
  onComplete: (score: number) => void
  onBack: () => void
}

export function TimelineGame({ events, onComplete, onBack }: TimelineGameProps) {
  const [shuffledEvents, setShuffledEvents] = useState<TimelineEvent[]>([])
  const [userOrder, setUserOrder] = useState<TimelineEvent[]>([])
  const [draggedItem, setDraggedItem] = useState<TimelineEvent | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    // Shuffle events when component mounts
    const shuffled = [...events].sort(() => Math.random() - 0.5)
    setShuffledEvents(shuffled)
  }, [events])

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isComplete) {
      handleSubmit()
    }
  }, [timeLeft, gameStarted, isComplete])

  const startGame = () => {
    setGameStarted(true)
  }

  const handleDragStart = (event: TimelineEvent) => {
    setDraggedItem(event)
  }

  const handleDrop = (index: number) => {
    if (draggedItem) {
      const newOrder = [...userOrder]
      const existingIndex = newOrder.findIndex((item) => item.id === draggedItem.id)

      if (existingIndex !== -1) {
        newOrder.splice(existingIndex, 1)
      }

      newOrder.splice(index, 0, draggedItem)
      setUserOrder(newOrder)
      setDraggedItem(null)
    }
  }

  const handleRemoveFromTimeline = (eventId: string) => {
    setUserOrder(userOrder.filter((event) => event.id !== eventId))
  }

  const handleSubmit = () => {
    const correctOrder = [...events].sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year))
    let correctCount = 0

    userOrder.forEach((event, index) => {
      if (correctOrder[index] && event.id === correctOrder[index].id) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / events.length) * 100)
    setScore(finalScore)
    setIsComplete(true)
    onComplete(finalScore)
  }

  const resetGame = () => {
    const shuffled = [...events].sort(() => Math.random() - 0.5)
    setShuffledEvents(shuffled)
    setUserOrder([])
    setIsComplete(false)
    setScore(0)
    setTimeLeft(120)
    setGameStarted(false)
  }

  const availableEvents = shuffledEvents.filter((event) => !userOrder.find((ordered) => ordered.id === event.id))

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <Card className="p-6 text-center">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Timeline Challenge</h2>
          <p className="text-muted-foreground mb-6 text-balance">
            Arrange the historical events in chronological order. You have 2 minutes to complete the challenge!
          </p>
          <div className="space-y-4">
            <Button onClick={startGame} className="w-full">
              Start Challenge
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
              Back to Lesson
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <Card className="p-6 text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              score >= 80
                ? "bg-green-100 text-green-600"
                : score >= 60
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {score >= 80 ? (
              <Trophy className="w-8 h-8" />
            ) : score >= 60 ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <X className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">Challenge Complete!</h2>
          <p className="text-4xl font-bold text-primary mb-4">{score}%</p>
          <p className="text-muted-foreground mb-6">
            {score >= 80
              ? "Excellent work! You're a history master!"
              : score >= 60
                ? "Good job! Keep practicing to improve."
                : "Don't give up! Try again to improve your score."}
          </p>
          <div className="space-y-3">
            <Button onClick={resetGame} className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
              Continue Learning
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ←
        </Button>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono ${timeLeft < 30 ? "text-red-500" : "text-muted-foreground"}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Timeline Area */}
      <Card className="p-4 mb-6">
        <h3 className="font-semibold mb-4">Timeline (Drag events here in order)</h3>
        <div className="space-y-2 min-h-[200px]">
          {userOrder.map((event, index) => (
            <div
              key={event.id}
              className="p-3 bg-primary/10 rounded-lg border-2 border-primary/20 cursor-pointer"
              onClick={() => handleRemoveFromTimeline(event.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {event.year}
                </Badge>
              </div>
            </div>
          ))}
          {userOrder.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              Drag events here to build your timeline
            </div>
          )}
        </div>
      </Card>

      {/* Available Events */}
      <Card className="p-4 mb-6">
        <h3 className="font-semibold mb-4">Available Events</h3>
        <div className="space-y-2">
          {availableEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-muted/50 rounded-lg border cursor-move hover:bg-muted/70 transition-colors"
              draggable
              onDragStart={() => handleDragStart(event)}
              onClick={() => handleDrop(userOrder.length)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {event.year}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Submit Button */}
      <Button onClick={handleSubmit} className="w-full" disabled={userOrder.length !== events.length}>
        Submit Timeline ({userOrder.length}/{events.length})
      </Button>
    </div>
  )
}
