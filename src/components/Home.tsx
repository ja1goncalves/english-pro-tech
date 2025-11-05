"use client";

import React, {useEffect, useState} from "react";
import { User } from "@/models/models";
import { Header } from "@/components/Header";
import {redirect} from "next/navigation";

export function Home() {
    const [user, setUser] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                setLoading(true)
                const res = await fetch('/frontend-api/proxy/user/me', { cache: 'no-store' })
                if (!res.ok) {
                    if (res.status === 401) {
                        setUser(null)
                        redirect('/login')
                    }
                    const text = await res.text()
                    throw new Error(text || `Failed to load roles (${res.status})`)
                }
                const data = (await res.json()) as User
                localStorage.setItem('eptCurrentUser', data.username);
                setUser(data)
            } catch (e: any) {
                setError(e.message || 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
        getCurrentUser()
    }, [])

    return (
        <div className="bg-slate-900 text-slate-100 min-h-[calc(100vh-2rem)] -mx-4 sm:mx-0">
            <Header />
            <div className="max-w-4xl mx-auto px-6 py-8">
                <main className="bg-white border border-gray-200 rounded-b-lg px-6 pb-8">

                    {/* Estados de Loading e Erro */}
                    {loading && <div className="text-center text-slate-400">Loading Missions...</div>}
                    {error && <div className="text-center text-red-500 text-sm">{error}</div>}

                    <div className="pt-6">
                        <h1 className="text-3xl font-bold text-slate-800">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
                        <p className="text-slate-500 mt-1">Let&apos;s continue your English learning journey.</p>
                    </div>

                    <div className="mt-6 p-6 rounded-lg bg-slate-600 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white-700 text-lg font-bold">Weekly Goal</h3>
                            <p className="text-white-500 text-sm">60% completed</p>
                        </div>
                        <div className="relative h-3 rounded-full bg-gray-200 mt-3">
                            <div className="absolute h-3 rounded-full bg-blue-500" style={{ width: '60%' }} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-slate-800 text-2xl font-bold">Your Learning Journey</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div className="flex flex-col gap-4 rounded-lg bg-white p-6 border border-gray-200 shadow-sm hover:shadow-lg transition">
                                <div className="flex-1">
                                    <h3 className="text-slate-800 text-lg font-bold">Pronunciation Training</h3>
                                    <p className="text-slate-500 text-sm mt-1">Master the nuances of English pronunciation.</p>
                                </div>
                                <a href="#" className="inline-flex items-center justify-center rounded-md h-10 px-4 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600">Start</a>
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