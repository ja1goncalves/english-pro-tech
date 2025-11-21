"use client"

import React, {useEffect, useMemo, useState} from 'react'
import {Header} from '@/components/Header'
import {PlayTask} from '@/components/PlayTask'
import {Role, RoleLevel, RolePlay} from '@/models/models'
import {useParams, useRouter} from 'next/navigation'
import { ErrorToast } from "@/components/ErrorToast";
import Link from 'next/link'

export default function PlayTaskPage() {
  const params = useParams<{ roleId: string; level: string; playCode: string }>()
  const router = useRouter()

  const roleId = params?.roleId
  const levelStep = useMemo(() => {
    const lv = params?.level
    const parsed = Number(lv)
    return Number.isNaN(parsed) ? null : parsed
  }, [params?.level])
  const playCode = useMemo(() => {
    try { return decodeURIComponent(params?.playCode || '') } catch { return params?.playCode || '' }
  }, [params?.playCode])

  const [roles, setRoles] = useState<Role[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setShowToast(false)
        const res = await fetch('/frontend-api/proxy/role-play', { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load roles (${res.status})`)
        }
        const data = (await res.json()) as Role[]
        setRoles(data)
      } catch (e: any) {
        setError(e.message || 'Failed to load')
        setShowToast(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const role: Role | undefined = useMemo(() => roles?.find(r => r._id === roleId), [roles, roleId])
  const level: RoleLevel | undefined = useMemo(() => role?.level?.find(lv => lv.step === levelStep), [role, levelStep])
  const play: RolePlay | undefined = useMemo(() => level?.plays?.find(p => p.code === playCode), [level, playCode])

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <Header />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        {/* Back to Missions */}
        <div className="mb-4">
          <Link href="/role-play" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
              <line x1="9" y1="12" x2="21" y2="12"></line>
            </svg>
            <span>Back to missions</span>
          </Link>
        </div>
        {loading && <div className="text-center text-slate-400 py-20">Loading missions...</div>}
        {error && <div className="text-center text-red-400 py-10 text-sm">{error}</div>}

        {!loading && !error && (!role || !level || !play) && (
          <div className="space-y-4 py-10 text-center">
            <p className="text-slate-300">Mission not found.</p>
            <button onClick={() => router.push('/role-play')} className="text-blue-400 hover:underline">Back</button>
          </div>
        )}

        {!loading && !error && role && level && play && (
          <PlayTask role={role} level={level} play={play} />
        )}
      </main>
      <ErrorToast show={showToast && !!error} message={error} onClose={() => setShowToast(false)} />
    </div>
  )
}
