"use client";

import Link from "next/link";
import React from "react";

export function Header() {
  const onLogout = async () => {
    await fetch("/frontend-api/session", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
      <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4">
          <div className="flex items-center gap-3 text-slate-100">
              <svg className="text-blue-500 h-8 w-8" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20"/></svg>
              <h2 className="text-lg font-bold">English Pro Tech</h2>
          </div>
          <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                  <Link className="text-slate-300 hover:text-blue-400 text-sm font-medium" href="/">Home</Link>
                  <Link className="text-blue-400 text-sm font-bold" href="/role-play">Missions</Link>
              </nav>
              <button onClick={onLogout} className="rounded-md px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-100">Logout</button>
          </div>
      </header>
  );
}