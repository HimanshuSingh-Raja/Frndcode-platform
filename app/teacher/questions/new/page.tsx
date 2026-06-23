"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import type { TestCase } from "@/lib/types"

import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

export default function NewQuestionPage() {
  const router = useRouter()
  const { addQuestion } = useAppStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [timeLimit, setTimeLimit] = useState(15)
  const [starterCode, setStarterCode] = useState(`function solution() {\n  // Your code here\n  \n}`)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: "tc-1", input: "", expectedOutput: "", isHidden: false },
  ])

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { id: `tc-${testCases.length + 1}`, input: "", expectedOutput: "", isHidden: false },
    ])
  }

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter((tc) => tc.id !== id))
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: string | boolean) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async () => {
    
  const newQuestion = {
  id: `q-${Date.now()}`,
  title,
  description,
  difficulty,
  timeLimit: timeLimit * 60,
  testCases,
  starterCode,
  tags,
  createdBy: "teacher-1",
  createdAt: new Date(),
}

await addDoc(collection(db, "questions"), newQuestion)

addQuestion(newQuestion)

router.push("/teacher/questions")
}
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 gap-2">
          <Link href="/teacher/questions">
            <ArrowLeft className="size-4" />
            Back to Questions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Question</h1>
        <p className="mt-1 text-muted-foreground">
          Design a coding challenge for your students
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Title and description of your question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Two Sum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the problem, include examples..."
                  className="min-h-40"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Supports Markdown formatting
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Starter code */}
          <Card>
            <CardHeader>
              <CardTitle>Starter Code</CardTitle>
              <CardDescription>Code template students will begin with</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-32 font-mono text-sm"
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Test cases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>Define inputs and expected outputs</CardDescription>
              </div>
              <Button onClick={addTestCase} variant="outline" size="sm" className="gap-1 bg-transparent">
                <Plus className="size-4" />
                Add Test Case
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.map((tc, index) => (
                <div key={tc.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium">Test Case {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTestCase(tc.id, "isHidden", !tc.isHidden)}
                        className="gap-1 text-xs"
                      >
                        {tc.isHidden ? (
                          <>
                            <EyeOff className="size-3" />
                            Hidden
                          </>
                        ) : (
                          <>
                            <Eye className="size-3" />
                            Visible
                          </>
                        )}
                      </Button>
                      {testCases.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestCase(tc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <Input
                        placeholder="e.g., [2,7,11,15], 9"
                        value={tc.input}
                        onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Input
                        placeholder="e.g., [0,1]"
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(v: "easy" | "medium" | "hard") => setDifficulty(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Categorize your question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} variant="outline" size="icon">
                  <Plus className="size-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!title || !description || testCases.some((tc) => !tc.input || !tc.expectedOutput)}
                >
                  Create Question
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/teacher/questions">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
