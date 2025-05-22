'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

// Define the shape of an organization based on what we know
// Duplicating from org-switcher for now, can be centralized later
interface ApiOrganization {
  id: number;
  display_name: string;
  is_active: boolean;
}

interface AuthContextType {
  token: string | null;
  organizations: ApiOrganization[] | null;
  selectedOrganizationId: string | null;
  isLoadingToken: boolean;
  isLoadingOrganizations: boolean;
  error: string | null;
  loginAndFetchToken: () => Promise<void>;
  fetchOrganizations: (forceRefresh?: boolean) => Promise<void>;
  setSelectedOrganization: (orgId: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_TOKEN_KEY = 'aiguro_token';
const LOCAL_STORAGE_ORGS_KEY = 'aiguro_organizations_context'; // Different from org-switcher's direct key
const LOCAL_STORAGE_SELECTED_ORG_ID_KEY = 'aiguro_selected_org_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<ApiOrganization[] | null>(
    null
  );
  const [selectedOrganizationId, setSelectedOrganizationIdState] = useState<
    string | null
  >(null);
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[AuthProvider] Initializing state from localStorage...');
    try {
      const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        console.log('[AuthProvider] Loaded token from localStorage.');
      } else {
        console.log('[AuthProvider] No token found in localStorage.');
      }

      const storedOrgs = localStorage.getItem(LOCAL_STORAGE_ORGS_KEY);
      if (storedOrgs) {
        setOrganizations(JSON.parse(storedOrgs));
        console.log('[AuthProvider] Loaded organizations from localStorage.');
      } else {
        console.log('[AuthProvider] No organizations found in localStorage.');
      }

      const storedSelectedOrgId = localStorage.getItem(
        LOCAL_STORAGE_SELECTED_ORG_ID_KEY
      );
      if (storedSelectedOrgId) {
        setSelectedOrganizationIdState(storedSelectedOrgId);
        console.log(
          '[AuthProvider] Loaded selected organization ID from localStorage.'
        );
      }
    } catch (e) {
      console.error('[AuthProvider] Error loading from localStorage:', e);
      // Clear potentially corrupted data
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_ORGS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ORG_ID_KEY);
    }
  }, []);

  const setSelectedOrganization = useCallback((orgId: string | null) => {
    setSelectedOrganizationIdState(orgId);
    if (orgId) {
      localStorage.setItem(LOCAL_STORAGE_SELECTED_ORG_ID_KEY, orgId);
      console.log(
        '[AuthProvider] Selected organization ID stored in localStorage:',
        orgId
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ORG_ID_KEY);
      console.log(
        '[AuthProvider] Selected organization ID removed from localStorage.'
      );
    }
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthProvider] Logging out and clearing data.');
    setToken(null);
    setOrganizations(null);
    setSelectedOrganizationIdState(null);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ORGS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SELECTED_ORG_ID_KEY);
    setError(null);
  }, []);

  const loginAndFetchToken = useCallback(async () => {
    if (token) {
      console.log('[AuthProvider] Token already exists, skipping fetch.');
      return;
    }
    setIsLoadingToken(true);
    setError(null);
    console.log('[AuthProvider] Fetching Aiguro token...');
    try {
      const response = await fetch('/api/token'); // GET request by default
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to fetch token' }));
        throw new Error(
          errorData.message || `Error fetching token: ${response.status}`
        );
      }
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, data.token);
        console.log('[AuthProvider] Token fetched and stored.');
      } else {
        throw new Error('Token not found in response');
      }
    } catch (e) {
      console.error('[AuthProvider] Error fetching token:', e);
      setError(e instanceof Error ? e.message : 'Unknown error fetching token');
      logout(); // Clear any partial or old token data on error
    } finally {
      setIsLoadingToken(false);
    }
  }, [token, logout]); // Added logout to dependency array

  const fetchOrganizations = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) {
        setError('Cannot fetch organizations: No authentication token.');
        console.warn(
          '[AuthProvider] Attempted to fetch organizations without a token.'
        );
        return;
      }
      if (
        organizations &&
        !forceRefresh &&
        selectedOrganizationId &&
        organizations.find((org) => String(org.id) === selectedOrganizationId)
      ) {
        console.log(
          '[AuthProvider] Organizations & valid selected Org ID already loaded, no force refresh, skipping fetch.'
        );
        return;
      }
      // If orgs loaded but selectedId is not valid or not set, we might still want to proceed if forced or selectedId is the issue.
      // The primary check for organizations && !forceRefresh is good for general cases.

      setIsLoadingOrganizations(true);
      setError(null);
      console.log('[AuthProvider] Fetching organizations...');
      try {
        const response = await fetch('/api/aiguro-organizations');
        if (!response.ok) {
          if (response.status === 401) {
            console.error(
              '[AuthProvider] Unauthorized (401) fetching organizations. Clearing token.'
            );
            logout();
            throw new Error('Authentication failed. Please log in again.');
          }
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Failed to fetch organizations' }));
          throw new Error(
            errorData.error ||
              `Error fetching organizations: ${response.status}`
          );
        }
        const fetchedOrgs: ApiOrganization[] = await response.json();
        setOrganizations(fetchedOrgs);
        localStorage.setItem(
          LOCAL_STORAGE_ORGS_KEY,
          JSON.stringify(fetchedOrgs)
        );
        console.log('[AuthProvider] Organizations fetched and stored.');

        // Validate current selectedOrganizationId
        if (selectedOrganizationId) {
          const currentSelectedIsValid = fetchedOrgs.some(
            (org) => String(org.id) === selectedOrganizationId
          );
          if (!currentSelectedIsValid) {
            console.warn(
              '[AuthProvider] Previously selected organization ID is no longer valid. Clearing it.'
            );
            setSelectedOrganization(null); // This will clear state and localStorage for selected ID
          } else {
            console.log(
              '[AuthProvider] Current selected organization ID is still valid.'
            );
          }
        } else if (fetchedOrgs.length > 0) {
          // If no org was selected, and we have orgs, maybe select the first one by default?
          // For now, let OrgSwitcher handle initial selection if selectedOrganizationId is null.
          // setSelectedOrganization(String(fetchedOrgs[0].id)); // Optional: auto-select first if none selected
          console.log(
            '[AuthProvider] Organizations fetched, no specific one was pre-selected.'
          );
        }
      } catch (e) {
        console.error('[AuthProvider] Error fetching organizations:', e);
        setError(
          e instanceof Error
            ? e.message
            : 'Unknown error fetching organizations'
        );
      } finally {
        setIsLoadingOrganizations(false);
      }
    },
    [
      token,
      organizations,
      selectedOrganizationId,
      logout,
      setSelectedOrganization
    ]
  );

  const isAuthenticated = useCallback(() => {
    return !!token;
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        organizations,
        selectedOrganizationId,
        isLoadingToken,
        isLoadingOrganizations,
        error,
        loginAndFetchToken,
        fetchOrganizations,
        setSelectedOrganization,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
