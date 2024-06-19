import React, { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

export default function DashboardHeader(props: Props) {
    return (
        <header>
            <div className="mx-auto max-w-7xl mb-6">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">{props.children}</h1>
            </div>
        </header>
    )
}
