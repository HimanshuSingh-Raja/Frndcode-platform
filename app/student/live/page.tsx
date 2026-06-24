"use client"

import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CodeEditor } from "@/components/code-editor/editor"
import { Timer } from "@/components/code-editor/timer"
import { TestResults } from "@/components/code-editor/test-results"
import { QuestionHelper } from "@/components/code-editor/question-helper"
import { useAppStore } from "@/lib/store"
import { mockQuestions, mockLiveSession } from "@/lib/mock-data"
import { AIHints } from "@/components/code-editor/ai-hints"
import {
  Radio,
  Play,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react"
import type { TestCase, TestResult } from "@/lib/types"

export default function LiveSessionPage() {
  const router = useRouter()
  const { activeSession, setActiveSession } = useAppStore()
  
  // Simulate an active session for demo
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, "liveSession", "current"),
    (snap) => {
      if (snap.exists()) {
        setSession(snap.data())
      }
    }
  )

  return () => unsubscribe()
}, [])

  const [isSessionActive, setIsSessionActive] = useState(true)
  
  const question = session
  const [code, setCode] = useState(question?.starterCode || "")
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[] | undefined>()
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<"passed" | "failed" | null>(null)

  const handleRun = async () => {
    setIsRunning(true)
    setTestResults(undefined)

    // Simulate running tests
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock test results
    const results: TestResult[] = question?.testCases
      .filter((tc: TestCase) => !tc.isHidden)
      .map((tc: TestCase) => ({
        testCaseId: tc.id,
        passed: Math.random() > 0.3,
        executionTime: Math.floor(Math.random() * 10) + 1,
        actualOutput: Math.random() > 0.5 ? tc.expectedOutput : "undefined",
      })) || []

    setTestResults(results)
    setIsRunning(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setTestResults(undefined)

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock all test results
    const allPassed = Math.random() > 0.4
    const results: TestResult[] = question?.testCases.map((tc: TestCase) => ({
      testCaseId: tc.id,
      passed: allPassed || Math.random() > 0.5,
      executionTime: Math.floor(Math.random() * 10) + 1,
    })) || []

    setTestResults(results)
    setHasSubmitted(true)
    setSubmissionStatus(results.every((r) => r.passed) ? "passed" : "failed")
    setIsSubmitting(false)
  }

  const handleTimeUp = () => {
    setIsSessionActive(false)
    if (!hasSubmitted) {
      handleSubmit()
    }
  }

  if (!session || !question) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </div>
            <CardTitle>No Active Session</CardTitle>
            <CardDescription>
              Wait for your teacher to start a live coding session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/student")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <div>
            <h1 className="font-semibold">{question.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge
                variant={
                  question.difficulty === "easy"
                    ? "secondary"
                    : question.difficulty === "medium"
                      ? "default"
                      : "destructive"
                }
                className="text-xs"
              >
                {question.difficulty}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {Math.floor(question.timeLimit / 60)} min
              </span>
            </div>
          </div>
        </div>

        <Timer
          initialSeconds={question.timeLimit}
          isRunning={isSessionActive && !hasSubmitted}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Problem description */}
        <div className="w-1/3 overflow-y-auto border-r p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problem Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm">
                {question.description}
              </div>
            </CardContent>
          </Card>

          {/* Question Helper */}
          <div className="mt-4">
            <QuestionHelper questionDescription={question.description} />
          </div>
        </div>

        {/* Right panel - Code editor and results */}
        <div className="flex flex-1 flex-col">
          {/* Code editor */}
          <div className="flex-1 p-4">
            <CodeEditor
              value={code}
              onChange={setCode}
              language="cpp"
              readOnly={hasSubmitted}
              className="h-full"
            />
          </div>

          {/* Actions and results */}
          <div className="border-t bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting || hasSubmitted}
                  className="gap-2 bg-transparent"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      Run Tests
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {hasSubmitted && (
                  <div className="flex items-center gap-2">
                    {submissionStatus === "passed" ? (
                      <>
                        <CheckCircle className="size-5 text-success" />
                        <span className="font-medium text-success">All tests passed!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-5 text-destructive" />
                        <span className="font-medium text-destructive">Some tests failed</span>
                      </>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting || hasSubmitted}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit Solution
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Test results */}
            {(testResults || isRunning) && (
              <div className="mt-4">
                <TestResults
                  testCases={question.testCases}
                  results={testResults}
                  isRunning={isRunning || isSubmitting}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
