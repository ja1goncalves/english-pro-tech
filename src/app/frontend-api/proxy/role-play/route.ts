import { NextRequest, NextResponse } from 'next/server'
import { getRolePlays, playTask } from "@/service/role-plays";

export async function GET() {
    const res = await getRolePlays()
    return new NextResponse(await res.text(), { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { roleId, level, playCode } = body
    const answer = body.answer || undefined
    const res = await playTask(roleId, level, playCode, answer)

    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
