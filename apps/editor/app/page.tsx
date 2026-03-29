"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, LogOut, Trash2, Clock, Loader2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

export default function Dashboard() {
  const projects = useQuery(api.projects.list)
  const createProject = useMutation(api.projects.create)
  const removeProject = useMutation(api.projects.remove)
  const { signOut } = useAuthActions()
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleNewProject = async () => {
    setCreating(true)
    try {
      const id = await createProject({
        name: "Untitled Project",
        data: JSON.stringify({}),
      })
      router.push(`/editor/${id}`)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, projectId: Id<"projects">) => {
    e.stopPropagation()
    await removeProject({ projectId })
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="min-h-screen" style={{ background: "#111113" }}>
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <h1 className="text-lg font-semibold text-white">Floor Plan</h1>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <button
            onClick={handleNewProject}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            New Project
          </button>
        </div>

        {projects === undefined ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-white/20" />
            </div>
            <p className="text-white/40 text-sm mb-4">No projects yet</p>
            <button
              onClick={handleNewProject}
              disabled={creating}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-all"
            >
              Create your first project
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/editor/${project._id}`)}
                className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all"
              >
                {/* Thumbnail placeholder */}
                <div className="mb-4 aspect-video rounded-xl bg-white/[0.04] border border-white/[0.04] flex items-center justify-center">
                  <span className="text-white/10 text-xs">3D Preview</span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{project.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-white/30 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project._id)}
                    className="rounded-lg p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
