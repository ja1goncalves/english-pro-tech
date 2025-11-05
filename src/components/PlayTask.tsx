"use client"

import React, {useCallback, useEffect, useMemo, useState} from "react";
import ReactMarkdown from 'react-markdown';
import {PlayStory, Role, RoleLevel, RolePlay, User} from "@/models/models";

interface PlayTaskProps {
  role: Role
  level: RoleLevel
  play: RolePlay
}

export function PlayTask({ role, level, play }: PlayTaskProps) {
  const [story, setStory] = useState<PlayStory | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)

  const loadStory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/frontend-api/proxy/user/me', { cache: 'no-store' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to load user (${res.status})`)
      }
      const user = (await res.json()) as User
      const found = (user.play_story || []).find(ps => ps.play_code === play.code)
      setStory(found || null)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [level.step, play.code, role._id])

  useEffect(() => {
    loadStory()
  }, [loadStory])

  const onSend = useCallback(async () => {
    if (!answer.trim()) return
    try {
      setSending(true)
      setError(null)
      const res = await fetch('/frontend-api/proxy/role-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role._id,
          level: level.step,
          playCode: play.code,
          answer: answer.trim(),
        })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to send message (${res.status})`)
      }
      // After successful send, refresh the story
      await loadStory()
      setAnswer("")
    } catch (e: any) {
      setError(e.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [answer, level.step, loadStory, play.code, role._id])

  const messages = useMemo(() => story?.metadata || [], [story])

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-slate-900/30 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header with play details */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Role {role.code} / Level {level.step}</p>
            <h1 className="text-lg font-bold text-slate-100">{role.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-300">{play.challenge}</p>
            <p className="text-xs text-slate-400">XP: {play.xp_done} / {play.xp}</p>
          </div>
        </div>
        {play.description && (
          <p className="mt-2 text-sm text-slate-300">{play.description}</p>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="text-center text-slate-400">Loading chat...</div>
        )}
        {error && (
          <div className="text-center text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm">No messages yet. Send a message to get started.</div>
        )}

        {!loading && !error && messages.map((m, idx) => (
          <div key={idx} className="space-y-2">
            {/* User question */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 text-white px-4 py-2 shadow">
                <div className="text-xs opacity-80 mb-0.5">You</div>
                <div className="whitespace-pre-wrap break-words">
                    <article className="prose prose-invert lg:prose-xl">
                        <ReactMarkdown>{m.answer || m.question}</ReactMarkdown>
                    </article>
                </div>
              </div>
            </div>
            {/* Machine response */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-700 text-slate-100 px-4 py-2 shadow">
                <div className="text-xs opacity-80 mb-0.5">Assistant</div>
                <div className="whitespace-pre-wrap break-words">
                    <article className="prose prose-invert lg:prose-xl">
                        <ReactMarkdown>{m.response}</ReactMarkdown>
                    </article>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 bg-slate-800 p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); onSend(); }}
          className="flex items-end gap-2"
        >
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 resize-none rounded-lg bg-slate-900 text-slate-100 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-40"
          />
          <button
            type="submit"
            disabled={sending || !answer.trim()}
            className={`px-4 py-2 rounded-lg font-semibold ${sending || !answer.trim() ? 'bg-slate-600 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white'} `}
            aria-disabled={sending || !answer.trim()}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
