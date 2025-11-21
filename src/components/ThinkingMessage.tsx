import React, {useEffect, useState, useRef} from "react";

export const ThinkingMessage: React.FC = () => {
    const [dots, setDots] = useState<number>(1);
    useEffect(() => {
        const t = setInterval(() => setDots(d => (d % 3) + 1), 450);
        return () => clearInterval(t);
    }, []);

    const text = `thinking${'.'.repeat(dots)}`;
    return (
        <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl text-white px-4 py-2 shadow bg-slate-700 rounded-bl-sm">
                <div className="text-xs opacity-80 mb-0.5">Assistant</div>
                <div className="flex items-center gap-2">
                    <svg className="animate-spin text-white/80" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    <span className="text-sm italic text-white/90">{text}</span>
                </div>
            </div>
        </div>
    );
}