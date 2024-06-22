import React from 'react';
import { useAccount } from 'wagmi';

import { useWorkflowStatusContext } from '../context/WorkflowStatusContext';
import { VotingStatus } from '@/lib/constants';
import { useUserRole } from '@/app/hooks/useUserRole'


const withWorkflowStatus = (WrappedComponent: React.ComponentType<any>) => {
    const ComponentWithWorkflowStatus = (props: any) => {
        const { isConnected } = useAccount();
        const { currentStatus, refetch } = useWorkflowStatusContext();
        const { isAdmin, isVoter } = useUserRole();

        return (
            <WrappedComponent
                {...props}
                isConnected={isConnected}
                workflowStatus={currentStatus}
                refetchWorkflowStatus={refetch}
                votingStatus={VotingStatus}
                isAdmin={isAdmin}
                isVoter={isVoter}
            />
        );
    };

    ComponentWithWorkflowStatus.displayName = `WithWorkflowStatus(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithWorkflowStatus;
};

export default withWorkflowStatus;
