export interface User {
  username: string
  role: "admin" | "guest"
}

export function login(username: string, password: string): User | null {
  if (username === "admin" && password === "admin123") {
    const user: User = { username: "admin", role: "admin" }
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
    return user
  }
  return null
}

export function loginAsGuest(): User {
  const user: User = { username: "guest", role: "guest" }
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
  return user
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null
  }

  const stored = localStorage.getItem("user")
  if (stored) {
    return JSON.parse(stored)
  }
  return null
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin"
}

export function isGuest(): boolean {
  const user = getCurrentUser()
  return user?.role === "guest"
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
