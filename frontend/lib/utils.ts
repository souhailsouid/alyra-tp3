import * as React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import VotingContract from '@/types/contracts/voting.sol/Voting.json'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const wagmiContractConfig = {
    address: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
    abi: VotingContract.abi,
}
