"use client"

import React, {useCallback, useEffect, useMemo, useState, useRef} from "react";
import {PlayStory, PlayTaskProps, User} from "@/models/models";
import {ChatMessage} from "@/components/ChatMessage";
import {ChatMessageAI} from "@/components/ChatMessageAI";
import {ThinkingMessage} from "@/components/ThinkingMessage";

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
    const [optimisticAnswer, setOptimisticAnswer] = useState<string | null>(null);
    const [showToast, setShowToast] = useState<boolean>(false);

    const recognitionRef = useRef<Window["SpeechRecognition"] | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

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
        recognition.lang = process.env.TTS_LANGUAGE || 'en-US'; // Set language to English

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
            // stop recording if it's on
            try { recognitionRef.current?.stop(); } catch {}
            setIsRecording(false);

            setSending(true)
            setError(null)
            const toSend = answer.trim();
            setOptimisticAnswer(toSend);
            const res = await fetch('/frontend-api/proxy/role-play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roleId: role._id,
                    level: level.step,
                    playCode: play.code,
                    answer: toSend,
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
            setShowToast(true)
        } finally {
            setSending(false)
            setOptimisticAnswer(null)
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

    // Auto scroll to bottom when messages or sending state changes
    useEffect(() => {
        const el = bottomRef.current;
        if (el) {
            // Smooth scroll to bottom
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, sending, optimisticAnswer]);

    // Auto hide toast after a few seconds
    useEffect(() => {
        if (!showToast) return;
        const t = setTimeout(() => setShowToast(false), 5000);
        return () => clearTimeout(t);
    }, [showToast]);

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] bg-slate-900/30 rounded-xl border border-slate-700 overflow-hidden" aria-busy={sending}>
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Role {role.code} / Level {level.step}</p>
                        <h1 className="text-lg font-bold text-slate-100">{role.name}</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-blue-300">{play.challenge}</p>
                        <p className="text-xs text-slate-400 flex items-center justify-end gap-2">
                            {sending && (
                                <svg className="animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                            )}
                            XP: {story?.xp || play.xp_done} / {play.xp}
                        </p>
                    </div>
                </div>
                {play.description && (
                    <p className="mt-2 text-sm text-slate-300">{play.description}</p>
                )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                            <ChatMessageAI
                                speaker="Assistant"
                                markdownText={assistantText}
                                rawText={assistantText}
                                agent={process.env.TTS_AGENT_AI?.includes("openai") ? "openai" : "gemini"}
                            />
                        </div>
                    )
                })}

                {/* Optimistic message and thinking placeholder while sending */}
                {sending && optimisticAnswer && (
                    <div className="space-y-2">
                        <ChatMessage
                            speaker="You"
                            markdownText={optimisticAnswer}
                            rawText={optimisticAnswer}
                        />
                        <ThinkingMessage />
                    </div>
                )}

                {/* Keep the bottom anchor for smooth auto-scroll */}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-slate-700 bg-slate-800 p-3">
                <form
                    onSubmit={(e) => { e.preventDefault(); onSend(); }}
                    className={`flex items-end gap-2 ${sending ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Digite sua mensagem..."}
                        disabled={sending}
                        aria-disabled={sending}
                        className="flex-1 resize-none rounded-lg bg-slate-900 text-slate-100 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-40 disabled:opacity-70"
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
                        className={`px-4 py-2 rounded-lg font-semibold h-[44px] flex items-center gap-2 ${sending || !answer.trim() ? 'bg-slate-600 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white'} `}
                        aria-disabled={sending || !answer.trim()}
                    >
                        {sending ? (
                            <>
                                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13"></path>
                                    <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                                </svg>
                                Send
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Error Toast */}
            {showToast && error && (
                <div className="fixed right-4 top-4 z-50">
                    <div className="bg-red-600 text-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12" y2="16"></line>
                        </svg>
                        <div className="flex-1 text-sm">{error}</div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="text-white/80 hover:text-white"
                            aria-label="Close error message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="6" height="6"></rect>
    </svg>
);