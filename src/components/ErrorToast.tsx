"use client"

import React, { useEffect } from "react";

export interface ErrorToastProps {
  show: boolean;
  message?: string | null;
  onClose: () => void;
  duration?: number; // milliseconds, default 5000
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  show,
  message,
  onClose,
  duration = 5000,
  className,
}) => {
  // Auto-dismiss
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [show, duration, onClose]);

  if (!show || !message) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-50 ${className || ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-red-600 text-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12" y2="16"></line>
        </svg>
        <div className="flex-1 text-sm">{message}</div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white"
          aria-label="Close error message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;
