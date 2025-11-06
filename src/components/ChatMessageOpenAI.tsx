"use client"

import React, {useEffect, useState, useRef} from "react";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    speaker: 'You' | 'Assistant';
    markdownText: string;
    rawText: string;
}

export const ChatMessageOpenAI: React.FC<ChatMessageProps> = ({ speaker, markdownText, rawText }) => {

    const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayAudio = async () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        if (audioRef.current && !isPlaying) {
            await audioRef.current.play();
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/frontend-api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: rawText }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${response.statusText}`);
            }

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
            };

            await audio.play();
            setIsPlaying(true);

        } catch (error) {
            console.error("Error playing TTS audio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTranscription = () => {
        setIsTranscriptionVisible(prev => !prev);
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                URL.revokeObjectURL(audioRef.current.src);
                audioRef.current = null;
            }
        };
    }, []);


    // Determine styling based on the speaker
    const isUser = speaker === 'You';
    const justifyClass = isUser ? 'justify-end' : 'justify-start';
    const bubbleClass = isUser
        ? 'bg-blue-600 rounded-br-sm' // User bubble
        : 'bg-slate-700 rounded-bl-sm'; // Assistant bubble

    return (
        <div className={`flex ${justifyClass}`}>
            <div className={`max-w-[80%] rounded-2xl text-white px-4 py-2 shadow ${bubbleClass}`}>
                <div className="text-xs opacity-80 mb-0.5">{speaker}</div>
                <button
                    onClick={handlePlayAudio}
                    className="px-3 py-1 text-sm bg-black/20 rounded-md hover:bg-black/40 transition-colors mb-2 disabled:opacity-50"
                    aria-label={isPlaying ? `Pause audio for ${speaker}'s message` : `Play audio for ${speaker}'s message`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin inline-block mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                    ) : isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    )}
                    {isLoading ? 'Loading...' : (isPlaying ? 'Pause' : 'Play')}
                </button>

                {/* 2. Message Transcription Button (Unchanged) */}
                <button
                    onClick={toggleTranscription}
                    className="px-3 py-1 text-sm bg-black/20 rounded-md hover:bg-black/40 transition-colors ml-2 mb-2"
                    aria-expanded={isTranscriptionVisible}
                >
                    {isTranscriptionVisible ? 'Hide' : 'Show'} Transcription
                </button>

                {/* 3. Hidden Message Content (Unchanged) */}
                {isTranscriptionVisible && (
                    <div className="whitespace-pre-wrap break-words border-t border-white/20 pt-2 mt-2">
                        <article className="prose prose-invert lg:prose-xl">
                            <ReactMarkdown>{markdownText}</ReactMarkdown>
                        </article>
                    </div>
                )}
            </div>
        </div>
    );
};