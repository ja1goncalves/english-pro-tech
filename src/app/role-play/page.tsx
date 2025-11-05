"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Role, RoleLevel, RolePlay } from "@/models/models";
import { getIcon, getPlacement } from "@/utils/helper";
import {Header} from "@/components/Header";

export default function RolePlayPage() {
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch('/frontend-api/proxy/role-play', { cache: 'no-store' })
                if (!res.ok) {
                    const text = await res.text()
                    throw new Error(text || `Failed to load roles (${res.status})`)
                }
                const data = (await res.json()) as Role[]
                setRoles(data)
            } catch (e: any) {
                setError(e.message || 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen">
            <Header />
            <main className="px-4 py-8">
                <div className="max-w-md mx-auto space-y-12">

                    {loading && <div className="text-center text-slate-400">Loading Missions...</div>}
                    {error && <div className="text-center text-red-500 text-sm">{error}</div>}

                    {roles?.map((role) => (
                        <section key={role._id} className="space-y-10">

                            {role.level?.map((lvl: RoleLevel) => (
                                <div key={lvl.step}>

                                    <div className={role.disabled || lvl.disabled ? 'bg-gray-500 text-gray-100 p-4 rounded-xl mb-10 shadow-md opacity-60' : 'bg-white text-blue-900 p-4 rounded-xl mb-10 shadow-lg'}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold uppercase opacity-90">
                                                    Seção {role.code} / Unidade {lvl.step}
                                                </p>
                                                <h2 className="text-2xl font-bold">{role.name}</h2>
                                            </div>
                                            <button className="bg-blue-900 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                                                GUIA
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 items-start gap-y-6">
                                        {(lvl.plays || []).map((p: RolePlay, index: number) => {

                                            // Assume que a primeira atividade (index 0) é a "atual"
                                            const isDisabled = lvl.disabled || role.disabled;
                                            const placement = getPlacement(index); // 0, 1, ou 2

                                            // O nó da atividade
                                            const node = (
                                                <div className="flex flex-col items-center text-center w-full">
                                                    {!isDisabled ? (
                                                        <>
                                                            {/* Botão "Começar" acima do item atual */}
                                                            <span className="uppercase text-white font-bold mb-2 text-sm tracking-wider">Começar</span>
                                                            {/* Nó da Atividade Atual: Brilhante, maior e clicável */}
                                                            <Link
                                                                href={`/role-play/play/${role._id}/${lvl.step}/${encodeURIComponent(p.code)}`}
                                                                className={
                                                                    p.played
                                                                    ? "flex items-center justify-center h-24 w-24 bg-green-300 rounded-full border-[6px] border-green-400 shadow-lg transform transition-transform hover:scale-105"
                                                                    : "flex items-center justify-center h-24 w-24 bg-blue-300 rounded-full border-[6px] border-blue-400 shadow-lg transform transition-transform hover:scale-105"}
                                                                title={p.challenge}
                                                            >
                                                                <span className="text-4xl">⭐</span>
                                                            </Link>
                                                            <p className="mt-2 text-sm font-semibold text-white">{p.challenge}</p>
                                                            <p className="text-xs text-green-400">+{p.xp} Pontos</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Nó da Atividade Bloqueada: Cinza e menor */}
                                                            <div
                                                                className="flex items-center justify-center h-20 w-20 bg-gray-700 rounded-full border-4 border-gray-600 shadow-md opacity-60"
                                                                title={p.challenge}
                                                            >
                                                                <span className="text-3xl">{getIcon(index)}</span>
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-400">{p.challenge}</p>
                                                        </>
                                                    )}
                                                </div>
                                            );

                                            // Renderiza o nó na coluna correta do grid
                                            return (
                                                <React.Fragment key={p.code}>
                                                    <div className={placement === 0 ? 'visible' : 'invisible'}>{node}</div>
                                                    <div className={placement === 1 ? 'visible' : 'invisible'}>{node}</div>
                                                    <div className={placement === 2 ? 'visible' : 'invisible'}>{node}</div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </section>
                    ))}

                    {/* Estado de "Nenhuma missão" */}
                    {!loading && roles && roles.length === 0 && (
                        <div className="text-gray-400 text-center">Nenhuma missão disponível.</div>
                    )}
                </div>
            </main>
        </div>
    )
}