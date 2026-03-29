"use client"

import { useConvexAuth } from "convex/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const PUBLIC_PATHS = ["/login"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated && !isPublic) {
      router.replace("/login")
    }
    if (isAuthenticated && isPublic) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, isPublic, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#111113" }}>
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!isAuthenticated && !isPublic) return null
  if (isAuthenticated && isPublic) return null

  return <>{children}</>
}
