import { useAccount, useReadContract } from 'wagmi'
import { wagmiContractConfig } from '@/lib/utils'
import { Proposal } from '@/lib/types'
import VotingContract from '@/types/contracts/voting.sol/Voting.json'

type Props = {
    proposalId: string
}

export default function ProposalDescription(props: Props) {
    const { address } = useAccount()

    const {
        data: proposal_,
        isLoading,
        error,
    } = useReadContract({
        ...wagmiContractConfig,
        functionName: 'getOneProposal',
        args: [props.proposalId],
        account: address,
    })

    if (isLoading) {
        return `Loading ...`
    }

    if (error?.cause) {
        return <p className="bg-red-100 p-1 text-sm text-red-500">{error.shortMessage}</p>
    }

    const proposal = proposal_ as Proposal | undefined

    return (
        <p className="inline-flex gap-4 items-center">
            {proposal?.description}
            <div className="bg-blue-100 p-1 rounded">Nombre de votes: {proposal?.voteCount.toString() || 0}</div>
        </p>
    )
}
