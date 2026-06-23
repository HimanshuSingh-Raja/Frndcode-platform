// "use client"

// import { useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Logo } from "@/components/logo"
// import { loginAsTeacher, loginAsStudent } from "@/lib/store"
// import { GraduationCap, BookOpen, ArrowRight } from "lucide-react"
// import { signInWithEmailAndPassword } from "firebase/auth"
// import { auth, db } from "@/lib/firebase"
// import { doc, getDoc } from "firebase/firestore"

// export default function LoginPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const defaultRole = searchParams.get("role") || "teacher"
//   const [isLoading, setIsLoading] = useState(false)
//   const [teacherUID, setTeacherUID] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("") 
  
//   const handleFirebaseLogin = async (role: "teacher" | "student") => {
//   try {
//     setIsLoading(true)

//  const teacherDoc = await getDoc(
//   doc(db, "Teachers", teacherUID)
// )

// if (!teacherDoc.exists()) {
//   alert("Teacher UID not found")
//   return
// }

// const teacherEmail = teacherDoc.data().email

// console.log("Teacher Data:", teacherDoc.data())
// console.log("Teacher Email:", teacherDoc.data().email)

//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       teacherEmail,
//       password
//     )

//     console.log("Logged in:", userCredential.user.email)

//     if (role === "teacher") {
//   router.push("/teacher")
//   return
// }

//     const userDoc = await getDoc(
//   doc(db, "users", userCredential.user.uid)
// )

// if (!userDoc.exists()) {
//   alert("User record not found")
//   return
// }

// const userRole = userDoc.data().role

// if (userRole === "teacher" || userRole === "admin") {
//   router.push("/teacher")
// } else {
//   router.push("/student")
// }
//   } 
//   catch (error: any) {
//   console.log("Firebase Error:", error)
//   console.log("Code:", error.code)
//   console.log("Message:", error.message)

//   let errorMessage = "Something went wrong. Please try again.";

//   switch (error.code) {
//     case "auth/invalid-credential":
//     case "auth/wrong-password":
//     case "auth/user-not-found":
//       errorMessage = "Invalid email or password";
//       break;

//     case "auth/invalid-email":
//       errorMessage = "Please enter a valid email address";
//       break;

//     case "auth/too-many-requests":
//       errorMessage = "Too many attempts. Please try again later";
//       break;
//   }

//   alert(errorMessage);
// } finally {
//   setIsLoading(false)
// }
// }

//   const handleDemoLogin = (role: "teacher" | "student") => {
//     setIsLoading(true)
//     setTimeout(() => {
//       if (role === "teacher") {
//         loginAsTeacher()
//         router.push("/teacher")
//       } else {
//         loginAsStudent()
//         router.push("/student")
//       }
//     }, 500)
//   }
//   return (
//     <div className="flex min-h-screen flex-col">
//       {/* Header */}
//       <header className="border-b">
//         <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
//           <Link href="/">
//             <Logo size="md" />
//           </Link>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="flex flex-1 items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           <div className="mb-8 text-center">
//             <h1 className="text-2xl font-bold">Welcome to FrndCode</h1>
//             <p className="mt-2 text-muted-foreground">Sign in to continue to your dashboard</p>
//           </div>

//           <Tabs defaultValue={defaultRole} className="w-full">
//             <TabsList className="mb-6 grid w-full grid-cols-2">
//               <TabsTrigger value="teacher" className="gap-2">
//                 <BookOpen className="size-4" />
//                 Teacher
//               </TabsTrigger>
//               <TabsTrigger value="student" className="gap-2">
//                 <GraduationCap className="size-4" />
//                 Student
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="teacher">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>TEACHER LOGIN TEST 123</CardTitle>
//                   <CardDescription>
//                     Access your dashboard to create questions and broadcast live sessions.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="teacher-uid">Teacher UID</Label>
//                     <Input id="teacher-uid" type="text" placeholder="TCH001" value={teacherUID} onChange={(e) => setTeacherUID(e.target.value)} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="teacher-password">Password</Label>
//                     <Input id="teacher-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
//                   </div>
//                   <Button className="w-full gap-2" onClick={() => handleFirebaseLogin("teacher")} disabled={isLoading}>
//                     {isLoading ? "Signing in..." : "Sign In as Teacher"}
//                     <ArrowRight className="size-4" />
//                   </Button>
//                   <div className="relative my-4">
//                     <div className="absolute inset-0 flex items-center">
//                       <span className="w-full border-t" />
//                     </div>
//                     <div className="relative flex justify-center text-xs uppercase">
//                       <span className="bg-card px-2 text-muted-foreground">Or</span>
//                     </div>
//                   </div>
//                   {/* <Button variant="outline" className="w-full bg-transparent" onClick={() => handleFirebaseLogin("teacher")} disabled={isLoading}>
//                     Try Demo Account
//                   </Button> */}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="student">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Student Sign In</CardTitle>
//                   <CardDescription>
//                     Join live coding sessions and practice your skills.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="student-email">Email</Label>
//                     <Input
//                    id="student-email" type="email" placeholder="test@frndcode.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="student-password">Password</Label>
//                     <Input id="student-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}/>
//                   </div>
//                   <Button className="w-full gap-2" onClick={() => handleFirebaseLogin("student")} disabled={isLoading}>
//                     {isLoading ? "Signing in..." : "Sign In as Student"}
//                     <ArrowRight className="size-4" />
//                   </Button>
//                   <div className="relative my-4">
//                     <div className="absolute inset-0 flex items-center">
//                       <span className="w-full border-t" />
//                     </div>
//                     <div className="relative flex justify-center text-xs uppercase">
//                       <span className="bg-card px-2 text-muted-foreground">Or</span>
//                     </div>
//                   </div>
//                   {/* <Button variant="outline" className="w-full bg-transparent" onClick={() => handleFirebaseLogin("student")} disabled={isLoading}>
//                     Try Demo Account
//                   </Button> */}
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           <p className="mt-6 text-center text-sm text-muted-foreground">
//             {"Don't have an account? "}
//            <Link
//   href="/signup"
//   className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">Sign up
// </Link>
//           </p>
//         </div>
//       </main>
//     </div>
//   )
// }
