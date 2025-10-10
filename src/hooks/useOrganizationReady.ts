import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export interface OrganizationReadyState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  backendOrgId: string | null;
}

export function useOrganizationReady(): OrganizationReadyState {
  const { organization, isLoaded } = useOrganization();
  const [state, setState] = useState<OrganizationReadyState>({
    isReady: false,
    isLoading: true,
    error: null,
    backendOrgId: null
  });

  useEffect(() => {
    if (!isLoaded) {
      setState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (!organization) {
      setState({
        isReady: false,
        isLoading: false,
        error: 'No organization selected',
        backendOrgId: null
      });
      return;
    }

    const backendOrgId = organization.publicMetadata?.id_backend as string;

    if (backendOrgId) {
      // Organization is ready - has backend ID
      setState({
        isReady: true,
        isLoading: false,
        error: null,
        backendOrgId
      });
    } else {
      // Organization exists but no backend ID - show loading state
      setState({
        isReady: false,
        isLoading: true,
        error: null,
        backendOrgId: null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, organization?.publicMetadata?.id_backend, isLoaded]);

  return state;
}
