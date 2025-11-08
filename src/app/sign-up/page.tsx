"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {Profile, StudentLevel} from "@/models/types";

export default function SignUpPage() {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [document, setDocument] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }
        try {
            setLoading(true)
            const res = await fetch('/frontend-api/proxy/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    name,
                    document,
                    level: StudentLevel.JR1,
                    profile: Profile.STUDENT
                }),
            })
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || `Registration failed (${res.status})`)
            }
            setSuccess('Account created! Redirecting to login...')
            setTimeout(() => router.replace('/login'), 1200)
        } catch (e: any) {
            setError(e?.message || 'Failed to register')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-900 min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <a className="inline-flex items-center gap-3" href="#">
                        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20"/></svg>
                        <h1 className="text-slate-900 text-2xl font-bold">English Pro Tech</h1>
                    </a>
                </div>
                <div className="bg-slate-800 rounded-xl p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-white-900 text-3xl font-bold">Create your account</h2>
                        <p className="text-white-300 mt-2">Start your journey to mastering English.</p>
                    </div>
                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-white-900" htmlFor="full-name">Full Name</label>
                            <div className="mt-1">
                                <input id="full-name" className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 px-4 bg-white text-blue-900" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white-900" htmlFor="full-name">Username</label>
                            <div className="mt-1">
                                <input id="username" className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 px-4 bg-white text-blue-900" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white-900" htmlFor="email">Email</label>
                            <div className="mt-1">
                                <input id="email" type="email" className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 px-4 bg-white text-blue-900" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white-900" htmlFor="email">CPF</label>
                            <div className="mt-1">
                                <input id="document" className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 px-4 bg-white text-blue-900" placeholder="Enter your CPF" value={document} onChange={(e) => setDocument(e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white-900" htmlFor="password">Password</label>
                            <div className="mt-1">
                                <input id="password" type="password" className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 px-4 bg-white text-blue-900" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white-900" htmlFor="confirm-password">Confirm Password</label>
                            <div className="mt-1">
                                <input id="confirm-password" type="password" className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 px-4 bg-white text-blue-900" placeholder="Confirm your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-600">{error}</div>}
                        {success && <div className="text-sm text-green-600">{success}</div>}

                        <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md border border-transparent bg-blue-500 py-3 px-4 text-base font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-200">
                        Already have an account? <a href="/login" className="font-medium text-blue-600 hover:text-blue-700">Login</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
