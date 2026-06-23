"use client"

import { doc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { mockStudents, mockSubmissions } from "@/lib/mock-data"
import {
  Radio,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Square,
  RefreshCw,
} from "lucide-react"

function BroadcastContent() {
  const searchParams = useSearchParams()
  const questionId = searchParams.get("question")
  const { questions, setActiveSession } = useAppStore()

  const [selectedQuestion, setSelectedQuestion] = useState(questionId || "")
  const [isLive, setIsLive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [participants, setParticipants] = useState<string[]>([])

  const question = questions.find((q) => q.id === selectedQuestion)

  useEffect(() => {
    if (isLive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((t) => t - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
    if (timeRemaining === 0 && isLive) {
      setIsLive(false)
      setActiveSession(null)
    }
  }, [isLive, timeRemaining, setActiveSession])

  const startBroadcast = async () => {
  if (!question) return

 await setDoc(
  doc(db, "liveSession", "current"),
  {
    questionId: question.id,
    title: question.title,
    description: question.description,
    difficulty: question.difficulty,

    starterCode: question.starterCode,
    timeLimit: question.timeLimit,
    testCases: question.testCases,

    isLive: true,
    startedAt: new Date().toISOString(),
  }
)

  setIsLive(true)
  setTimeRemaining(question.timeLimit)
  setParticipants(mockStudents.map((s) => s.id))
}


  const stopBroadcast = async () => {
  await updateDoc(
    doc(db, "liveSession", "current"),
    {
      isLive: false,
    }
  )

  setIsLive(false)
  setTimeRemaining(0)
}

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Simulated live submissions
  const liveSubmissions = mockSubmissions.filter((s) => s.questionId === selectedQuestion)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Broadcast Session</h1>
        <p className="mt-1 text-muted-foreground">
          Stream coding challenges to your students in real-time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main controls */}
        <div className="space-y-6 lg:col-span-2">
          {/* Question selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Question</CardTitle>
              <CardDescription>Choose a question to broadcast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedQuestion}
                onValueChange={setSelectedQuestion}
                disabled={isLive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a question" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      <div className="flex items-center gap-2">
                        <span>{q.title}</span>
                        <Badge
                          variant={
                            q.difficulty === "easy"
                              ? "secondary"
                              : q.difficulty === "medium"
                                ? "default"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {q.difficulty}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {question && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-semibold">{question.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {question.description.replace(/`/g, "").replace(/\*\*/g, "").slice(0, 200)}...
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {Math.floor(question.timeLimit / 60)} min
                    </span>
                    <span>{question.testCases.length} test cases</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live status */}
          {isLive && (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex size-3 rounded-full bg-red-500" />
                    </span>
                    <CardTitle className="text-lg">Session Live</CardTitle>
                  </div>
                  <Badge variant="destructive" className="text-lg font-mono">
                    {formatTime(timeRemaining)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="size-4" />
                    {participants.length} students connected
                  </span>
                  <span className="text-success">
                    {liveSubmissions.filter((s) => s.status === "passed").length} passed
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Live Submissions</CardTitle>
              <CardDescription>
                {isLive ? "Watch submissions come in real-time" : "Start a session to see submissions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLive ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Radio className="mb-2 size-8" />
                  <p>No active session</p>
                  <p className="text-sm">Select a question and start broadcasting</p>
                </div>
              ) : liveSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <RefreshCw className="mb-2 size-8 animate-spin" />
                  <p>Waiting for submissions...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSubmissions.map((submission) => {
                    const student = mockStudents.find((s) => s.id === submission.studentId)
                    return (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={student?.avatar || "/placeholder.svg"} alt={student?.name} />
                            <AvatarFallback>{student?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{student?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted{" "}
                              {new Date(submission.submittedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission.status === "passed" ? (
                            <Badge className="gap-1 bg-success text-success-foreground">
                              <CheckCircle className="size-3" />
                              Passed
                            </Badge>
                          ) : submission.status === "failed" ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="size-3" />
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {submission.executionTime && (
                            <span className="text-xs text-muted-foreground">
                              {submission.executionTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Broadcast controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLive ? (
                <Button
                  className="w-full gap-2"
                  onClick={startBroadcast}
                  disabled={!selectedQuestion}
                >
                  <Play className="size-4" />
                  Start Broadcast
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={stopBroadcast}
                >
                  <Square className="size-4" />
                  End Session
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4" />
                Participants
              </CardTitle>
              <CardDescription>
                {isLive ? `${participants.length} connected` : "No active session"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLive ? (
                <div className="space-y-2">
                  {mockStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted"
                    >
                      <Avatar className="size-6">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-sm">{student.name}</span>
                      <span className="size-2 rounded-full bg-success" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Start a session to see participants
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BroadcastPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BroadcastContent />
    </Suspense>
  )
}
