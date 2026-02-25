"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, RotateCcw, Trophy, Target } from "lucide-react"

interface DragDropItem {
  id: string
  content: string
  category: string
  description?: string
}

interface DragDropCategory {
  id: string
  name: string
  description: string
  color: string
}

interface DragDropGameProps {
  items: DragDropItem[]
  categories: DragDropCategory[]
  title: string
  onComplete: (score: number) => void
  onBack: () => void
}

export function DragDropGame({ items, categories, title, onComplete, onBack }: DragDropGameProps) {
  const [shuffledItems, setShuffledItems] = useState<DragDropItem[]>([])
  const [categoryItems, setCategoryItems] = useState<Record<string, DragDropItem[]>>({})
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect" | null>>({})

  useEffect(() => {
    // Initialize shuffled items and empty categories
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    setShuffledItems(shuffled)

    const initialCategories: Record<string, DragDropItem[]> = {}
    categories.forEach((cat) => {
      initialCategories[cat.id] = []
    })
    setCategoryItems(initialCategories)
  }, [items, categories])

  const startGame = () => {
    setGameStarted(true)
  }

  const handleDragStart = (item: DragDropItem) => {
    setDraggedItem(item)
  }

  const handleDrop = (categoryId: string) => {
    if (draggedItem) {
      // Remove item from shuffled items
      setShuffledItems((prev) => prev.filter((item) => item.id !== draggedItem.id))

      // Remove item from other categories if it exists
      const newCategoryItems = { ...categoryItems }
      Object.keys(newCategoryItems).forEach((catId) => {
        newCategoryItems[catId] = newCategoryItems[catId].filter((item) => item.id !== draggedItem.id)
      })

      // Add item to target category
      newCategoryItems[categoryId] = [...newCategoryItems[categoryId], draggedItem]
      setCategoryItems(newCategoryItems)
      setDraggedItem(null)
    }
  }

  const handleRemoveFromCategory = (item: DragDropItem, categoryId: string) => {
    // Remove from category
    const newCategoryItems = { ...categoryItems }
    newCategoryItems[categoryId] = newCategoryItems[categoryId].filter((i) => i.id !== item.id)
    setCategoryItems(newCategoryItems)

    // Add back to shuffled items
    setShuffledItems((prev) => [...prev, item])
  }

  const handleSubmit = () => {
    let correctCount = 0
    const newFeedback: Record<string, "correct" | "incorrect" | null> = {}

    // Check each item in categories
    Object.entries(categoryItems).forEach(([categoryId, items]) => {
      items.forEach((item) => {
        if (item.category === categoryId) {
          correctCount++
          newFeedback[item.id] = "correct"
        } else {
          newFeedback[item.id] = "incorrect"
        }
      })
    })

    const finalScore = Math.round((correctCount / items.length) * 100)
    setScore(finalScore)
    setFeedback(newFeedback)
    setIsComplete(true)
    onComplete(finalScore)
  }

  const resetGame = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    setShuffledItems(shuffled)

    const initialCategories: Record<string, DragDropItem[]> = {}
    categories.forEach((cat) => {
      initialCategories[cat.id] = []
    })
    setCategoryItems(initialCategories)

    setIsComplete(false)
    setScore(0)
    setGameStarted(false)
    setFeedback({})
  }

  const totalPlacedItems = Object.values(categoryItems).reduce((sum, items) => sum + items.length, 0)

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <Card className="p-6 text-center">
          <Target className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6 text-balance">
            Drag and drop items into their correct categories. Take your time to think about each placement!
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
              ? "Outstanding! You really understand the concepts!"
              : score >= 60
                ? "Well done! You're getting the hang of it."
                : "Keep learning! Practice makes perfect."}
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
        <h1 className="text-lg font-bold">{title}</h1>
        <Badge variant="secondary">
          {totalPlacedItems}/{items.length}
        </Badge>
      </div>

      {/* Categories */}
      <div className="space-y-4 mb-6">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-4 h-4 rounded-full bg-${category.color}`} />
              <h3 className="font-semibold">{category.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{category.description}</p>

            <div
              className="min-h-[80px] border-2 border-dashed border-muted rounded-lg p-2 space-y-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(category.id)}
            >
              {categoryItems[category.id]?.map((item) => (
                <div
                  key={item.id}
                  className={`p-2 rounded border cursor-pointer text-sm ${
                    feedback[item.id] === "correct"
                      ? "bg-green-100 border-green-300 text-green-800"
                      : feedback[item.id] === "incorrect"
                        ? "bg-red-100 border-red-300 text-red-800"
                        : "bg-muted border-muted-foreground/20"
                  }`}
                  onClick={() => handleRemoveFromCategory(item, category.id)}
                >
                  <div className="font-medium">{item.content}</div>
                  {item.description && <div className="text-xs opacity-70 mt-1">{item.description}</div>}
                  {feedback[item.id] && (
                    <div className="flex items-center gap-1 mt-1">
                      {feedback[item.id] === "correct" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span className="text-xs">{feedback[item.id] === "correct" ? "Correct!" : "Incorrect"}</span>
                    </div>
                  )}
                </div>
              ))}
              {categoryItems[category.id]?.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">Drop items here</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Available Items */}
      {shuffledItems.length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Items to Categorize</h3>
          <div className="space-y-2">
            {shuffledItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-secondary/50 rounded-lg border cursor-move hover:bg-secondary/70 transition-colors"
                draggable
                onDragStart={() => handleDragStart(item)}
              >
                <div className="font-medium text-sm">{item.content}</div>
                {item.description && <div className="text-xs text-muted-foreground mt-1">{item.description}</div>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <Button onClick={handleSubmit} className="w-full" disabled={shuffledItems.length > 0}>
        Check My Answers
      </Button>
    </div>
  )
}
