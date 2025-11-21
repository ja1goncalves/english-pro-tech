"use client";

import React, {useContext, useEffect, useMemo, useState} from "react";
import { Header } from "@/components/Header";
import {AuthContext} from "@/components/AuthProvider";
import {Role, RoleLevel, RolePlay, User} from "@/models/models";

function Stat({label, value, sub}: {label: string, value: React.ReactNode, sub?: string}) {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">{label}</div>
            <div className="text-xl font-extrabold text-slate-800 mt-1">{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
    )
}

function ProgressBar({value}: {value: number}) {
    const pct = Math.max(0, Math.min(100, Math.round(value)))
    return (
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-3 bg-blue-500 rounded-full" style={{width: `${pct}%`}}/>
        </div>
    )
}

function UserDataCard({user}: {user: User}) {
    const lastActivity = useMemo(() => {
        const all = (user.play_story || []).flatMap(ps => ps.metadata || [])
        const dates = all.map(m => new Date(m.created_at))
        const last = dates.sort((a,b) => b.getTime() - a.getTime())[0]
        return last ? last.toLocaleString() : '—'
    }, [user])

    const totalIterations = (user.play_story || []).reduce((acc, ps) => acc + (ps.metadata?.length || 0), 0)
    const totalXPFromStories = (user.play_story || []).reduce((acc, ps) => {
        if (ps.metadata && ps.metadata.length > 0) {
            return acc + ps.metadata.reduce((a, m) => a + (m.xp || 0), 0)
        }
        return acc + (ps.xp || 0)
    }, 0)

    const avgXPPerIter = totalIterations > 0 ? (totalXPFromStories / totalIterations) : 0

    return (
        <section className="mt-6 p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
            <h3 className="text-slate-800 text-xl font-bold">Your Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <Stat label="Username" value={user.username} />
                <Stat label="Email" value={user.email} />
                <Stat label="Level" value={user.level || '—'} />
                <Stat label="XP in Iterations" value={(user.xp ?? totalXPFromStories) + ' in ' + totalIterations} />
                <Stat label="Avg XP/Iteration" value={avgXPPerIter.toFixed(1)} />
                <Stat label="Last Active" value={lastActivity} />
            </div>
        </section>
    )
}

function findRoleByCodeOrId(roles: Role[], roleKey?: string) {
    if (!roleKey) return null
    return roles.find(r => r.code === roleKey || r._id === roleKey) || null
}

function findLevelByXPOrStep(role: Role | null, user: User | null, fallbackStep?: number): RoleLevel | null {
    if (!role) return null
    const levels = role.level || []
    if (user?.xp != null) {
        const lvl = levels.find(l => user.xp! >= l.min_xp && user.xp! <= l.max_xp)
        if (lvl) return lvl
    }
    if (fallbackStep != null) {
        const lvl = levels.find(l => l.step === fallbackStep)
        if (lvl) return lvl
    }
    // fallback to first level
    return levels[0] || null
}

function Dashboard({user, roles}: {user: User, roles: Role[]}) {
    const lastStory = (user.play_story || [])[Math.max(0, (user.play_story?.length || 1) - 1)]
    const currentRole = findRoleByCodeOrId(roles, lastStory?.role) || roles[0] || null
    const currentLevel = findLevelByXPOrStep(currentRole, user, lastStory?.level_step || undefined)

    const levelXPMin = currentLevel?.min_xp ?? 0
    const levelXPMax = currentLevel?.max_xp ?? 100
    const userXP = user.xp ?? 0
    const progressPct = ((userXP - levelXPMin) / Math.max(1, (levelXPMax - levelXPMin))) * 100
    const xpToNext = Math.max(0, levelXPMax - userXP)

    const plays: RolePlay[] = currentLevel?.plays || []
    const completed = plays.filter(p => (p.xp_done ?? 0) >= (p.xp ?? 0)).length
    const remaining = Math.max(0, plays.length - completed)

    const totalIterations = (user.play_story || []).reduce((acc, ps) => acc + (ps.metadata?.length || 0), 0)
    const totalXPFromStories = (user.play_story || []).reduce((acc, ps) => {
        if (ps.metadata && ps.metadata.length > 0) {
            return acc + ps.metadata.reduce((a, m) => a + (m.xp || 0), 0)
        }
        return acc + (ps.xp || 0)
    }, 0)
    const avgXPPerIter = totalIterations > 0 ? (totalXPFromStories / totalIterations) : 0

    return (
        <section className="mt-8">
            <h2 className="text-slate-800 text-2xl font-bold">Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-500 font-bold uppercase">Role</div>
                            <div className="text-xl font-extrabold text-slate-900">{currentRole?.name || '—'} {currentRole ? `( ${currentRole.code} )` : ''}</div>
                            <div className="text-sm text-slate-600 mt-1">Level {currentLevel?.step ?? '—'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500">XP</div>
                            <div className="text-2xl font-extrabold text-slate-900">{userXP}</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>{levelXPMin} XP</span>
                            <span>{levelXPMax} XP</span>
                        </div>
                        <ProgressBar value={progressPct} />
                        <div className="text-xs text-slate-500 mt-2">{xpToNext} XP to complete current level</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Stat label="Plays Completed" value={completed} sub={`${plays.length} total`} />
                    <Stat label="Plays Remaining" value={remaining} sub={`${plays.length} total`} />
                    <Stat label="Iterations" value={totalIterations} />
                    <Stat label="Avg XP/Iter" value={avgXPPerIter.toFixed(1)} />
                </div>
            </div>

            {/* Simple activity blocks as a pseudo-graph */}
            <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="text-slate-800 text-lg font-bold mb-3">Recent Activity</div>
                <div className="grid grid-cols-12 gap-1">
                    {(user.play_story || []).slice(-12).map((ps, idx) => {
                        const intensity = Math.min(1, (ps.xp || 0) / 100)
                        const g = Math.floor(200 - 100 * intensity)
                        return (
                            <div key={idx} className="h-8 rounded text-xs font-extrabold inline-flex items-center justify-center" title={`Role ${ps.role} • L${ps.level_step} • ${ps.xp} XP`}
                                 style={{ backgroundColor: `rgb(59, 130, 246, ${Math.pow(0.2 + intensity * 0.6, 1/3)})` }}>{ps.xp} XP</div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export function Home() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [me, setMe] = useState<User | null>(null)
    const { user: ctxUser } = useContext(AuthContext);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                // Fetch user and roles in parallel
                const [uRes, rRes] = await Promise.all([
                    fetch('/frontend-api/proxy/user/me', { cache: 'no-store' }),
                    fetch('/frontend-api/proxy/role-play', { cache: 'no-store' })
                ])
                if (!uRes.ok) {
                    const text = await uRes.text()
                    throw new Error(text || `Failed to load user (${uRes.status})`)
                }
                if (!rRes.ok) {
                    const text = await rRes.text()
                    throw new Error(text || `Failed to load roles (${rRes.status})`)
                }
                const [uData, rData] = [await uRes.json() as User, await rRes.json() as Role[]]
                setMe(uData)
                setRoles(rData)
            } catch (e: any) {
                setError(e.message || 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const user = me || ctxUser

    return (
        <div className="bg-slate-900 text-slate-100 min-h-[calc(100vh-2rem)] -mx-4 sm:mx-0">
            <Header />
            <div className="max-w-5xl mx-auto px-6 py-8">
                <main className="bg-slate-50 border border-gray-200 rounded-b-lg px-6 pb-8">

                    {loading && <div className="text-center text-slate-400 py-6">Loading your dashboard...</div>}
                    {error && <div className="text-center text-red-500 text-sm py-2">{error}</div>}

                    <div className="pt-6">
                        <h1 className="text-3xl font-bold text-slate-800">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
                        <p className="text-slate-500 mt-1">Let&apos;s continue your English learning journey.</p>
                    </div>

                    {user && <UserDataCard user={user} />}

                    {user && roles && roles.length > 0 && (
                        <Dashboard user={user} roles={roles} />
                    )}

                    {/* Quick actions */}
                    <div className="mt-8">
                        <h2 className="text-slate-800 text-2xl font-bold">Continue Learning</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div className="flex flex-col gap-4 rounded-lg bg-white p-6 border border-gray-200 shadow-sm hover:shadow-lg transition">
                                <div className="flex-1">
                                    <h3 className="text-slate-800 text-lg font-bold">Pronunciation Training</h3>
                                    <p className="text-slate-500 text-sm mt-1">Master the nuances of English pronunciation.</p>
                                </div>
                                <a href="/role-play" className="inline-flex items-center justify-center rounded-md h-10 px-4 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600">Start</a>
                            </div>
                            <div className="flex flex-col gap-4 rounded-lg bg-white p-6 border border-gray-200 shadow-sm hover:shadow-lg transition">
                                <div className="flex-1">
                                    <h3 className="text-slate-800 text-lg font-bold">Interview RolePlay</h3>
                                    <p className="text-slate-500 text-sm mt-1">Practice interview skills with scenarios.</p>
                                </div>
                                <a href="/role-play" className="inline-flex items-center justify-center rounded-md h-10 px-4 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600">Start</a>
                            </div>
                            <div className="flex flex-col gap-4 rounded-lg bg-white p-6 border border-gray-200 shadow-sm hover:shadow-lg transition">
                                <div className="flex-1">
                                    <h3 className="text-slate-800 text-lg font-bold">Missions</h3>
                                    <p className="text-slate-500 text-sm mt-1">Complete missions to earn badges and XP.</p>
                                </div>
                                <a href="/role-play" className="inline-flex items-center justify-center rounded-md h-10 px-4 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600">Start</a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}