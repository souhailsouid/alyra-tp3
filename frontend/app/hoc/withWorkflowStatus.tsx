import React from 'react';

import { useWorkflowStatusContext } from '../context/WorkflowStatusContext';
import { VotingStatus } from '@/lib/constants';
import { useUserRole } from '@/app/hooks/useUserRole'


const withWorkflowStatus = (WrappedComponent: React.ComponentType<any>) => {
    const ComponentWithWorkflowStatus = (props: any) => {

        const { currentStatus, refetch } = useWorkflowStatusContext();
        const { isAdmin, isVoter, isUserRoleLoading,  isConnected,  } = useUserRole();

        return (
            <WrappedComponent
                {...props}
                isConnected={isConnected}
                workflowStatus={currentStatus}
                refetchWorkflowStatus={refetch}
                votingStatus={VotingStatus}
                isAdmin={isAdmin}
                isVoter={isVoter}
                isUserRoleLoading={isUserRoleLoading}
       
            />
        );
    };

    ComponentWithWorkflowStatus.displayName = `WithWorkflowStatus(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithWorkflowStatus;
};

export default withWorkflowStatus;
