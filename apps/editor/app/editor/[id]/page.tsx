"use client"

import { useQuery, useMutation } from "convex/react"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Editor, useUploadStore } from "@pascal-app/editor"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAutoSave } from "@/hooks/use-auto-save"
import type { Id } from "@/convex/_generated/dataModel"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const convex = useConvex()
  const projectId = params.id as Id<"projects">
  const project = useQuery(api.projects.get, { projectId })
  const saveProject = useMutation(api.projects.save)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const debouncedSave = useAutoSave(projectId)
  const [saveStatus, setSaveStatus] = useState<string>("idle")

  const handleLoad = useCallback(async () => {
    if (!project?.data) return null
    try {
      return JSON.parse(project.data)
    } catch {
      return null
    }
  }, [project?.data])

  const handleSave = useCallback(
    async (scene: unknown) => {
      const data = JSON.stringify(scene)
      await saveProject({ projectId, data })
    },
    [projectId, saveProject]
  )

  const handleDirty = useCallback(() => {
    setSaveStatus("unsaved")
  }, [])

  const handleUploadAsset = useCallback(
    async (pid: string, levelId: string, file: File, type: "scan" | "guide") => {
      const store = useUploadStore.getState()
      store.startUpload(levelId, type, file.name)

      try {
        // Get upload URL from Convex
        store.setStatus(levelId, "uploading")
        const uploadUrl = await generateUploadUrl()

        // Upload file directly to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!result.ok) {
          throw new Error("Upload failed")
        }

        const { storageId } = await result.json()

        // Get the public URL for the uploaded file
        store.setProgress(levelId, 90)
        store.setStatus(levelId, "confirming")

        const url = await convex.query(api.files.getUrl, { storageId })
        if (!url) throw new Error("Failed to get file URL")

        store.setResult(levelId, url)
      } catch (err) {
        store.setError(levelId, err instanceof Error ? err.message : "Upload failed")
      }
    },
    [generateUploadUrl, convex]
  )

  const handleDeleteAsset = useCallback(
    async (pid: string, url: string) => {
      // Convex storage files are cleaned up automatically when no longer referenced
      console.log("Asset removed from scene:", url)
    },
    []
  )

  // Loading state
  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#111113" }}>
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  // Project not found
  if (project === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4" style={{ background: "#111113" }}>
        <p className="text-white/40">Project not found</p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2 text-sm text-white hover:bg-white/[0.12] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <Editor
        projectId={projectId}
        onLoad={handleLoad}
        onSave={handleSave}
        onDirty={handleDirty}
        onSaveStatusChange={(status) => setSaveStatus(status)}
        sitePanelProps={{
          projectId,
          onUploadAsset: handleUploadAsset,
          onDeleteAsset: handleDeleteAsset,
        }}
        appMenuButton={
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </button>
        }
      />
    </div>
  )
}
