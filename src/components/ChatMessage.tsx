"use client"

import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from 'react-markdown';

export const ChatMessage: React.FC<{
    speaker: 'You' | 'Assistant';
    markdownText: string;
    rawText: string;
}> = ({ speaker, markdownText, rawText }) => {

    const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const utterance = useMemo(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return null;

        const u = new SpeechSynthesisUtterance(rawText);
        u.onend = () => setIsPlaying(false);
        u.onerror = () => {
            console.error('Speech synthesis error');
            setIsPlaying(false);
        };

        return u;
    }, [rawText]);

    useEffect(() => {
        return () => {
            if (isPlaying && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isPlaying]);

    const handlePlayAudio = () => {
        if (!utterance || !window.speechSynthesis) {
            console.warn('Speech synthesis not supported or utterance not ready.');
            return;
        }

        const synth = window.speechSynthesis;
        if (synth.speaking && isPlaying) {
            // Case 1: It's currently speaking *this* message -> PAUSE
            synth.pause();
            setIsPlaying(false);
        } else if (synth.paused && !isPlaying) {
            // Case 2: It's paused (we assume it's this one) -> RESUME
            synth.resume();
            setIsPlaying(true);
        } else {
            // Case 3: It's not speaking, or speaking something else -> START FRESH
            synth.cancel(); // Stop any other utterance
            synth.speak(utterance);
            setIsPlaying(true);
        }
    };

    const toggleTranscription = () => {
        setIsTranscriptionVisible(prev => !prev);
    };

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
                    className="px-3 py-1 text-sm bg-black/20 rounded-md hover:bg-black/40 transition-colors mb-2"
                    aria-label={isPlaying ? `Pause audio for ${speaker}'s message` : `Play audio for ${speaker}'s message`}
                    disabled={!utterance}
                >
                    {isPlaying ? (
                        // Pause Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    ) : (
                        // Play Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <button
                    onClick={toggleTranscription}
                    className="px-3 py-1 text-sm bg-black/20 rounded-md hover:bg-black/40 transition-colors ml-2 mb-2"
                    aria-expanded={isTranscriptionVisible}
                >
                    {isTranscriptionVisible ? 'Hide' : 'Show'} Transcription
                </button>

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