"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRef, useCallback } from "react"
import type { Id } from "@/convex/_generated/dataModel"

export function useAutoSave(projectId: Id<"projects"> | null) {
  const save = useMutation(api.projects.save)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const debouncedSave = useCallback(
    (data: string) => {
      if (!projectId) return
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        save({ projectId, data })
      }, 2000)
    },
    [projectId, save]
  )

  return debouncedSave
}
