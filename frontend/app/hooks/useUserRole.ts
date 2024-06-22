import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'

import { wagmiContractConfig } from '@/lib/utils'

export const useUserRole = () => {
    const { address, isConnected } = useAccount()
    const [isVoter, setIsVoter] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [isUserRoleLoading, setIsLoading] = useState(true)
    const [errorUserRole, setError] = useState<Error | null>(null)

    useWatchContractEvent({
        ...wagmiContractConfig,
        eventName: 'VoterRegistered',
        fromBlock: 1n,
        onLogs: (logs: any[]) => {
            setIsVoter(logs.some((log) => log.args.voterAddress === address))
        },
    })

    const { data: ownerAddress, error: ownerError } = useReadContract({
        ...wagmiContractConfig,
        functionName: 'owner',
    })

    useEffect(() => {
        if (ownerAddress) {
            ownerAddress === address ? setIsAdmin(true) : setIsAdmin(false)
            setIsLoading(false)
        }
        if (ownerError) {
            setError(ownerError)
            setIsLoading(false)
        }
    }, [ownerAddress, ownerError, address, isUserRoleLoading])

    return { ownerAddress, errorUserRole, isAdmin, isConnected, isUserRoleLoading, isVoter }
}
