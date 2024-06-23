'use client'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { Toaster } from '@/components/ui/sonner'

import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { WorkflowStatusProvider } from './context/WorkflowStatusContext'

const config = getDefaultConfig({
    appName: 'TP3 Alyra',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    chains: process.env.NEXT_PUBLIC_ENV === 'localhost' ? [hardhat] : [sepolia],
    ssr: true,
})

const client = new QueryClient()

function MyApp({ children }: { children: ReactNode }) {
    return (
        <html>
            <body className="h-full">
                <WagmiProvider config={config}>
                    <QueryClientProvider client={client}>
                        <RainbowKitProvider>
                            <WorkflowStatusProvider>
                                {children}
                                <Toaster
                                    toastOptions={{
                                        classNames: {
                                            error: 'bg-red-500 text-white',
                                            success: 'text-green-400',
                                            warning: 'text-yellow-400',
                                            info: 'bg-blue-400',
                                        },
                                    }}
                                />
                            </WorkflowStatusProvider>
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </body>
        </html>
    )
}

export default MyApp
