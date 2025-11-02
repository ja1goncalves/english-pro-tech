export interface RolePlay {
    code: string
    challenge: string
    xp: number
    description?: string | null
}

export interface RoleLevel {
    step: number
    min_xp: number
    max_xp: number
    plays?: RolePlay[]
}

export interface Role {
    _id: string
    code: string
    name: string
    min_xp: number
    max_xp: number
    level?: RoleLevel[]
}