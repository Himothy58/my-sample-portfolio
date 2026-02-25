"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, RotateCcw, Trophy, Code, Play } from "lucide-react"

interface CodeBlock {
  id: string
  code: string
  description: string
}

interface CodingPuzzleProps {
  title: string
  description: string
  codeBlocks: CodeBlock[]
  correctOrder: string[]
  expectedOutput: string
  onComplete: (score: number) => void
  onBack: () => void
}

export function CodingPuzzle({
  title,
  description,
  codeBlocks,
  correctOrder,
  expectedOutput,
  onComplete,
  onBack,
}: CodingPuzzleProps) {
  const [shuffledBlocks, setShuffledBlocks] = useState<CodeBlock[]>([])
  const [userOrder, setUserOrder] = useState<CodeBlock[]>([])
  const [draggedBlock, setDraggedBlock] = useState<CodeBlock | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const startGame = () => {
    const shuffled = [...codeBlocks].sort(() => Math.random() - 0.5)
    setShuffledBlocks(shuffled)
    setGameStarted(true)
  }

  const handleDragStart = (block: CodeBlock) => {
    setDraggedBlock(block)
  }

  const handleDrop = (index: number) => {
    if (draggedBlock) {
      const newOrder = [...userOrder]
      const existingIndex = newOrder.findIndex((block) => block.id === draggedBlock.id)

      if (existingIndex !== -1) {
        newOrder.splice(existingIndex, 1)
      }

      newOrder.splice(index, 0, draggedBlock)
      setUserOrder(newOrder)

      // Remove from shuffled blocks
      setShuffledBlocks((prev) => prev.filter((block) => block.id !== draggedBlock.id))
      setDraggedBlock(null)
    }
  }

  const handleRemoveFromProgram = (blockId: string) => {
    const blockToRemove = userOrder.find((block) => block.id === blockId)
    if (blockToRemove) {
      setUserOrder(userOrder.filter((block) => block.id !== blockId))
      setShuffledBlocks((prev) => [...prev, blockToRemove])
    }
  }

  const handleRunProgram = () => {
    setShowOutput(true)

    // Check if the order is correct
    const isCorrect =
      userOrder.length === correctOrder.length && userOrder.every((block, index) => block.id === correctOrder[index])

    const finalScore = isCorrect ? 100 : Math.round((userOrder.length / correctOrder.length) * 50)
    setScore(finalScore)
    setIsComplete(true)
    onComplete(finalScore)
  }

  const resetGame = () => {
    setShuffledBlocks([])
    setUserOrder([])
    setIsComplete(false)
    setScore(0)
    setGameStarted(false)
    setShowOutput(false)
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <Card className="p-6 text-center">
          <Code className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6 text-balance">{description}</p>
          <div className="space-y-4">
            <Button onClick={startGame} className="w-full">
              Start Coding
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
          <h2 className="text-2xl font-bold mb-2">Program Complete!</h2>
          <p className="text-4xl font-bold text-primary mb-4">{score}%</p>

          {showOutput && (
            <Card className="p-4 mb-4 bg-black text-green-400 font-mono text-left">
              <div className="text-xs mb-2">Output:</div>
              <div className="text-sm">{expectedOutput}</div>
            </Card>
          )}

          <p className="text-muted-foreground mb-6">
            {score >= 80
              ? "Excellent coding! You're a natural programmer!"
              : score >= 60
                ? "Good work! Keep practicing your coding skills."
                : "Don't give up! Programming takes practice."}
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
          {userOrder.length}/{codeBlocks.length}
        </Badge>
      </div>

      {/* Program Area */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Your Program</h3>
        </div>

        <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 min-h-[200px]">
          {userOrder.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Drag code blocks here to build your program</div>
          ) : (
            <div className="space-y-2">
              {userOrder.map((block, index) => (
                <div
                  key={block.id}
                  className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleRemoveFromProgram(block.id)}
                >
                  <div className="text-xs text-gray-400 mb-1">Line {index + 1}</div>
                  <div>{block.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Available Code Blocks */}
      {shuffledBlocks.length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Code Blocks</h3>
          <div className="space-y-2">
            {shuffledBlocks.map((block) => (
              <div
                key={block.id}
                className="p-3 bg-secondary/50 rounded-lg border cursor-move hover:bg-secondary/70 transition-colors"
                draggable
                onDragStart={() => handleDragStart(block)}
                onClick={() => handleDrop(userOrder.length)}
              >
                <div className="font-mono text-sm mb-1">{block.code}</div>
                <div className="text-xs text-muted-foreground">{block.description}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Run Button */}
      <Button onClick={handleRunProgram} className="w-full gap-2" disabled={userOrder.length === 0}>
        <Play className="w-4 h-4" />
        Run Program
      </Button>
    </div>
  )
}
