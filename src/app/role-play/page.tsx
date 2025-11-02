"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Role, RoleLevel, RolePlay } from "@/models/models";

export default function RolePlayPage() {
  const [roles, setRoles] = useState<Role[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/frontend-api/proxy/role-play', { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load roles (${res.status})`)
        }
        const data = (await res.json()) as Role[]
        setRoles(data)
      } catch (e: any) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onLogout = async () => {
    await fetch('/frontend-api/session', { method: 'DELETE' })
    window.location.href = '/login'
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-2rem)] -mx-4 sm:mx-0">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3 text-slate-900">
          <svg className="text-blue-500 h-8 w-8" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20"/></svg>
          <h2 className="text-lg font-bold">English Pro Tech</h2>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-gray-600 hover:text-blue-600 text-sm font-medium" href="/">Home</Link>
            <span className="text-blue-600 text-sm font-bold">Missions</span>
          </nav>
          <button onClick={onLogout} className="rounded-md px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700">Logout</button>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Missions</h1>
            <p className="text-gray-500">Complete missions to earn points and badges.</p>
          </div>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles?.flatMap((role) => (
              role.level?.flatMap((lvl: RoleLevel) => (
                (lvl.plays || []).map((p: RolePlay) => (
                  <div key={`${role._id}-${lvl.step}-${p.code}`} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                        <span className="material-symbols-outlined text-3xl text-blue-600">edit_note</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-slate-900 text-lg font-bold leading-tight">{p.code}</p>
                        <p className="text-gray-500 text-sm font-normal leading-normal">+{p.xp} Points</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{p.challenge}</p>
                    <Link href={`/role-play/play/${role._id}/${lvl.step}/${encodeURIComponent(p.code)}`} className="inline-flex items-center justify-center rounded-md h-10 px-4 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 w-fit">
                      Start Mission
                    </Link>
                  </div>
                ))
              )) || []
            ))}
          </div>

          {!loading && roles && roles.length === 0 && (
            <div className="text-gray-500">No roles available.</div>
          )}
        </div>
      </main>
    </div>
  )
}
