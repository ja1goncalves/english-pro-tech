"use client"

import React, {useCallback, useEffect, useMemo, useState, useRef} from "react";
import {PlayStory, PlayTaskProps, User} from "@/models/models";
import {ChatMessage} from "@/components/ChatMessage";

// Declare the SpeechRecognition type for window
// This is necessary because it's a browser-specific API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function PlayTask({ role, level, play }: PlayTaskProps) {
    const [story, setStory] = useState<PlayStory | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [answer, setAnswer] = useState<string>("")
    const [sending, setSending] = useState<boolean>(false)
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const recognitionRef = useRef<Window["SpeechRecognition"] | null>(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported by this browser.");
            return; // If not supported, the mic button just won't work
        }

        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Set language to English

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAnswer(prevAnswer => (prevAnswer ? prevAnswer.trim() + ' ' : '') + transcript);
        };

        recognition.onend = () => {
            setIsRecording(false); // Update button state
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false); // Reset button state
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

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
            await loadStory()
            setAnswer("")
        } catch (e: any) {
            setError(e.message || 'Failed to send message')
        } finally {
            setSending(false)
        }
    }, [answer, level.step, loadStory, play.code, role._id])

    const messages = useMemo(() => story?.metadata || [], [story])

    const handleToggleRecording = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return; // Do nothing if speech rec is not supported

        if (isRecording) {
            recognition.stop(); // Manually stop listening
        } else {
            recognition.start(); // Start listening
        }
        setIsRecording(!isRecording); // Toggle state
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] bg-slate-900/30 rounded-xl border border-slate-700 overflow-hidden">
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

                {!loading && !error && messages.map((m, idx) => {
                    const userText = m.answer || m.question;
                    const assistantText = m.response;

                    return (
                        <div key={idx} className="space-y-2">
                            {/* User question */}
                            <ChatMessage
                                speaker="You"
                                markdownText={userText}
                                rawText={userText}
                            />

                            {/* Machine response */}
                            <ChatMessage
                                speaker="Assistant"
                                markdownText={assistantText}
                                rawText={assistantText}
                            />
                        </div>
                    )
                })}
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
                        placeholder={isRecording ? "Listening..." : "Digite sua mensagem..."}
                        className="flex-1 resize-none rounded-lg bg-slate-900 text-slate-100 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-40"
                    />

                    {/* NEW: Microphone Button */}
                    <button
                        type="button" // Important: prevents form submission
                        onClick={handleToggleRecording}
                        disabled={sending || !recognitionRef.current} // Disable if sending or not supported
                        className={`p-2 rounded-lg font-semibold h-[44px] w-[44px] flex items-center justify-center ${
                            isRecording
                                ? 'bg-red-700 hover:bg-red-600 text-white'
                                : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                        } disabled:opacity-50`}
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                    >
                        {isRecording ? <MicStopIcon /> : <MicIcon />}
                    </button>

                    {/* Existing Send Button */}
                    <button
                        type="submit"
                        disabled={sending || !answer.trim()}
                        className={`px-4 py-2 rounded-lg font-semibold h-[44px] ${sending || !answer.trim() ? 'bg-slate-600 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white'} `}
                        aria-disabled={sending || !answer.trim()}
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// + NEW: Helper SVG Icons for the microphone button
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
    </svg>
);

const MicStopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="6" height="6"></rect>
    </svg>
);