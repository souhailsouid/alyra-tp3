import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useWorkflowStatusContext } from '../context/WorkflowStatusContext';


const withAuthMiddleware = (WrappedComponent: React.ComponentType<any>) => {
    const ComponentWithAuth = (props: any) => {
        const { status, isConnected } = useAccount();
        const { isLoading, } = useWorkflowStatusContext();
        const { isAdmin, isVoter } = useUserRole();

        useEffect(() => {

        }, [isConnected]);


        if (isLoading) return <div>Verification en cours ...</div>;

        if (!isConnected) {
            return <p>Connectez-vous pour accéder à cette page</p>;
        }


        if (!isVoter && status === "connected" && !isAdmin) {
            return <div>Vous n&apos;êtes pas autorisé à accéder à cette page</div>;
        }


        return <WrappedComponent {...props} />;
    };

    ComponentWithAuth.displayName = `withAuthMiddleware(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithAuth;
};

export default withAuthMiddleware;
