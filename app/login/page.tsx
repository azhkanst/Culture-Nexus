"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { login, loginAsGuest } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const user = login(username, password)
    if (user) {
      router.push("/")
    } else {
      setError("Invalid username or password")
    }
    setLoading(false)
  }

  const handleGuestLogin = () => {
    setLoading(true)
    loginAsGuest()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Node Graph System</h1>
          <p className="text-gray-300">Choose your access level to continue</p>
        </div>

        {/* Admin Login Card */}
        <Card className="shadow-lg bg-gray-800 border-gray-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-white">
              <Lock className="w-5 h-5 text-blue-400" />
              Admin Login
            </CardTitle>
            <p className="text-sm text-gray-300">Full access to edit and manage all content</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-200">
                  Username
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="pl-10 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-10 pr-10 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-700/50">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign in as Admin"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-300 font-medium mb-1">Demo Credentials:</p>
              <p className="text-xs text-gray-400">Username: admin</p>
              <p className="text-xs text-gray-400">Password: admin123</p>
            </div>
          </CardContent>
        </Card>

        {/* Guest Access Card */}
        <Card className="shadow-lg bg-gray-800 border-gray-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-white">
              <Eye className="w-5 h-5 text-green-400" />
              Guest Access
            </CardTitle>
            <p className="text-sm text-gray-300">View-only access to explore the system</p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGuestLogin}
              variant="outline"
              className="w-full border-green-600 text-green-400 hover:bg-green-900/20 hover:text-green-300 bg-transparent"
              disabled={loading}
            >
              Continue as Guest
            </Button>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-400">
                • View all maps and nodes
                <br />• No editing permissions
                <br />• Perfect for exploring the system
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>Choose admin mode for full functionality or guest mode for read-only access</p>
        </div>
      </div>
    </div>
  )
}
