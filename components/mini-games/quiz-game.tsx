'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, X } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizGameProps {
  questions: QuizQuestion[]
  title: string
  onComplete: (score: number, timeSpent: number) => void
}

export function QuizGame({ questions, title, onComplete }: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<Record<number, number>>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAnswerSelect = (index: number) => {
    if (!showFeedback) {
      setSelectedAnswer(index)
    }
  }

  const handleSubmitAnswer = () => {
    const question = questions[currentQuestion]
    const isCorrect = selectedAnswer === question.correctAnswer

    setAnswered((prev) => ({
      ...prev,
      [currentQuestion]: selectedAnswer ?? -1,
    }))

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    setShowFeedback(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setIsComplete(true)
      onComplete(Math.round((score / questions.length) * 100), timeSpent)
    }
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
        <div className="mb-6">
          <div className="text-5xl font-bold text-blue-600 mb-2">{percentage}%</div>
          <p className="text-gray-600 text-lg">
            You got {score} out of {questions.length} correct
          </p>
          <p className="text-gray-500 text-sm mt-2">Time: {timeSpent} seconds</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-700">
            {percentage >= 80
              ? 'Excellent work! You have mastered this topic.'
              : percentage >= 60
                ? 'Good effort! Keep practicing to improve.'
                : 'Keep learning! Review the material and try again.'}
          </p>
        </div>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const isAnswerCorrect = answered[currentQuestion] === question.correctAnswer

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900">{question.question}</h3>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? showFeedback
                    ? index === question.correctAnswer
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                  : showFeedback && index === question.correctAnswer
                    ? 'bg-green-50 border-green-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
              } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-blue-600' : 'border-gray-300'
                  }`}
                >
                  {selectedAnswer === index && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                </div>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              isAnswerCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isAnswerCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${isAnswerCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isAnswerCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {question.explanation && (
                  <p className={`text-sm mt-2 ${isAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!showFeedback ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
