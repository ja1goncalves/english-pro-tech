"use client"

import React, { useState } from 'react'
import {Home} from "@/components/Home";
import { ErrorToast } from "@/components/ErrorToast";

export default function DashboardPage() {
    const [pageError, setPageError] = useState<string | null>(null)
    const [showToast, setShowToast] = useState(false)

    return (
        <>
            <Home />
            <ErrorToast show={showToast && !!pageError} message={pageError} onClose={() => setShowToast(false)} />
        </>
    )
}
