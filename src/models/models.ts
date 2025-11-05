import {Profile, StudentLevel} from "@/models/types";

export interface RolePlay {
    code: string
    challenge: string
    xp: number
    description?: string | null
    disabled: boolean
    played: boolean
    xp_done: number
}

export interface RoleLevel {
    step: number
    min_xp: number
    max_xp: number
    plays?: RolePlay[]
    disabled: boolean
}

export interface Role {
    _id: string
    code: string
    name: string
    min_xp: number
    max_xp: number
    level?: RoleLevel[]
    disabled: boolean
}
export interface PlayMetadata {
    answer: string | null
    question: string
    response: string
    xp: number
    update_level: boolean
    created_at: Date
    disabled: boolean
}

export interface PlayStory {
    role: string
    level_step: number
    play_code: string
    xp: number
    metadata: PlayMetadata[]
}

export interface User {
    _id: string
    username: string
    email: string
    name: null
    profile: Profile
    document?: string
    level?: StudentLevel
    xp?: number | null
    play_story?: PlayStory[]
}