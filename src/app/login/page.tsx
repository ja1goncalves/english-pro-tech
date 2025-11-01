"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const params = useSearchParams()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const form = new URLSearchParams()
            form.set('username', username)
            form.set('password', password)
            const res = await fetch('/frontend-api/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: form.toString(),
            })
            if (!res.ok) {
                const data = await res.json().catch(async () => ({ message: await res.text() }))
                throw new Error(data?.message || `Login failed (${res.status})`)
            }
            const next = params.get('next') || '/role-play'
            router.replace(next)
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                        <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="20" />
                        </svg>
                        <h1>English Pro Tech</h1>
                    </div>
                </div>
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
                        <p className="text-gray-500">Sign in to continue your learning journey.</p>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900" htmlFor="username">Username</label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    className="form-input block w-full rounded-md border-gray-300 bg-white px-4 py-3 text-slate-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900" htmlFor="password">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    className="form-input block w-full rounded-md border-gray-300 bg-white px-4 py-3 text-slate-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}
                        <button className="flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" disabled={loading} type="submit">
                            {loading ? 'Signing in...' : 'Login'}
                        </button>
                        <div className="mt-2 text-center text-sm text-gray-500">
                            Don&apos;t have an account? <a href="/sign-up" className="font-medium text-blue-600 hover:underline">Sign up</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
