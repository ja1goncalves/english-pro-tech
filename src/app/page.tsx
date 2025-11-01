import React from 'react'
import Link from "next/link";

async function getUser() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/frontend-api/proxy/user/me`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as {
        username: string
        name?: string | null
        xp?: number | null
    }
}

export default async function DashboardPage() {
    const user = await getUser()

    return (
        <div className="bg-[#F8F9FA] min-h-[calc(100vh-2rem)] -mx-4 sm:mx-0">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3 text-slate-800">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">school</span>
                        <h2 className="text-xl font-bold">English Pro Tech</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <Link className="text-slate-600 hover:text-blue-600" href="/">Home</Link>
                        <Link className="text-slate-600 hover:text-blue-600" href="/role-play">Missions</Link>
                    </nav>
                </header>

                <main className="bg-white border border-gray-200 rounded-b-lg px-6 pb-8">
                    <div className="pt-6">
                        <h1 className="text-3xl font-bold text-slate-800">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
                        <p className="text-slate-500 mt-1">Let&apos;s continue your English learning journey.</p>
                    </div>

                    <div className="mt-6 p-6 rounded-lg bg-white border border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-slate-700 text-lg font-bold">Weekly Goal</h3>
                            <p className="text-slate-500 text-sm">60% completed</p>
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
