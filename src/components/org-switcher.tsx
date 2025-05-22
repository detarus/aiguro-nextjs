'use client';

import { Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Tenant {
  id: string;
  name: string;
}

const AddCompanyModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyName: string) => void;
  isLoading: boolean;
}) => {
  const [companyName, setCompanyName] = useState('');
  useEffect(() => {
    if (isOpen) {
      setCompanyName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (companyName.trim() && !isLoading) {
      onSubmit(companyName.trim());
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-background w-full max-w-md rounded-lg p-6 shadow-xl'>
        <h2 className='mb-4 text-lg font-semibold'>Добавить новую компанию</h2>
        <div>
          <Label
            htmlFor='companyNameModalAdd'
            className='mb-2 block text-sm font-medium'
          >
            Название компании
          </Label>
          <Input
            id='companyNameModalAdd'
            type='text'
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder='Введите название компании'
            className='mb-4'
            disabled={isLoading}
          />
        </div>
        <div className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Добавление...' : 'Добавить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyName: string | undefined;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-background w-full max-w-md rounded-lg p-6 shadow-xl'>
        <h2 className='mb-4 text-lg font-semibold'>Подтверждение удаления</h2>
        <p className='mb-6'>
          Вы действительно хотите удалить компанию &quot;
          <b>{companyName || ''}</b>&quot;?
        </p>
        <div className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Удаление...' : 'Да, удалить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export function OrgSwitcher({
  onTenantSwitch
}: {
  onTenantSwitch?: (tenantId: string) => void;
}) {
  const {
    token,
    organizations: contextOrganizations,
    selectedOrganizationId: contextSelectedOrgId,
    fetchOrganizations: contextFetchOrganizations,
    setSelectedOrganization: contextSetSelectedOrg,
    isAuthenticated,
    isLoadingOrganizations,
    error: authError
  } = useAuth();

  const [displayedTenants, setDisplayedTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>(
    undefined
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const refreshOrganizations = useCallback(async () => {
    console.log('[OrgSwitcher] Refreshing organizations via AuthContext...');
    try {
      await contextFetchOrganizations(true);
      return true;
    } catch (error) {
      console.error(
        '[OrgSwitcher] Error during contextFetchOrganizations trigger:',
        error
      );
      return false;
    }
  }, [contextFetchOrganizations]);

  useEffect(() => {
    if (contextOrganizations) {
      const mappedTenants: Tenant[] = contextOrganizations.map((org) => ({
        id: String(org.id),
        name: org.display_name
      }));
      setDisplayedTenants(mappedTenants);
      console.log(
        '[OrgSwitcher] Mapped organizations from context to displayedTenants.'
      );
    } else {
      setDisplayedTenants([]);
    }
  }, [contextOrganizations]);

  useEffect(() => {
    if (contextSelectedOrgId && displayedTenants.length > 0) {
      const tenantFromContext = displayedTenants.find(
        (t) => t.id === contextSelectedOrgId
      );
      if (tenantFromContext) {
        setSelectedTenant(tenantFromContext);
        console.log(
          '[OrgSwitcher] Synced local selectedTenant from contextSelectedOrgId:',
          tenantFromContext
        );
      } else {
        console.warn(
          `[OrgSwitcher] contextSelectedOrgId (${contextSelectedOrgId}) not found in displayedTenants. Attempting to select first.`
        );
        if (displayedTenants.length > 0) {
          setSelectedTenant(displayedTenants[0]);
          contextSetSelectedOrg(displayedTenants[0].id);
        } else {
          setSelectedTenant(undefined);
        }
      }
    } else if (displayedTenants.length > 0 && !contextSelectedOrgId) {
      console.log(
        '[OrgSwitcher] No selected org in context, defaulted to first tenant:',
        displayedTenants[0]
      );
      setSelectedTenant(displayedTenants[0]);
      contextSetSelectedOrg(displayedTenants[0].id);
    } else if (displayedTenants.length === 0) {
      setSelectedTenant(undefined);
    }
  }, [contextSelectedOrgId, displayedTenants, contextSetSelectedOrg]);

  useEffect(() => {
    if (isAuthenticated() && !contextOrganizations && !isLoadingOrganizations) {
      console.log('[OrgSwitcher] Initial fetch of organizations triggered.');
      contextFetchOrganizations();
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'aiguro_organizations_context' ||
        event.key === 'aiguro_selected_org_id'
      ) {
        console.log(
          `[OrgSwitcher] Detected storage change for ${event.key}. Triggering refresh/re-evaluation.`
        );
        if (event.key === 'aiguro_organizations_context') {
          refreshOrganizations();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [
    isAuthenticated,
    contextOrganizations,
    isLoadingOrganizations,
    contextFetchOrganizations,
    refreshOrganizations
  ]);

  const handleTenantSwitch = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    contextSetSelectedOrg(tenant.id);
    if (onTenantSwitch) {
      onTenantSwitch(tenant.id);
    }
    setIsOrgDropdownOpen(false);
    window.location.reload();
  };

  const handleAddCompanySubmit = async (companyName: string) => {
    console.log('[OrgSwitcher] Attempting to add new company:', companyName);
    setIsAddingCompany(true);
    setAddModalError(null);
    try {
      const response = await fetch('/api/aiguro-organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to add company.' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      const newOrganization = await response.json();
      setIsAddModalOpen(false);
      await refreshOrganizations();
      contextSetSelectedOrg(String(newOrganization.id));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[OrgSwitcher] Error adding company:', errorMessage);
      setAddModalError(errorMessage);
    } finally {
      setIsAddingCompany(false);
    }
  };

  const handleDeleteCompanyClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteModalOpen(true);
    setDeleteModalError(null);
    setIsOrgDropdownOpen(false);
  };

  const executeDeleteCompany = async () => {
    if (!tenantToDelete) return;
    setIsDeletingCompany(true);
    setDeleteModalError(null);
    try {
      const response = await fetch(
        `/api/aiguro-organizations/${tenantToDelete.id}`,
        {
          method: 'DELETE'
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to delete company.' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      console.log(
        `[OrgSwitcher] Successfully deleted company ID: ${tenantToDelete.id}`
      );
      setIsDeleteModalOpen(false);
      if (contextSelectedOrgId === tenantToDelete.id) {
        contextSetSelectedOrg(null);
      }
      setTenantToDelete(null);
      await refreshOrganizations();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[OrgSwitcher] Error deleting company:', errorMessage);
      setDeleteModalError(errorMessage);
    } finally {
      setIsDeletingCompany(false);
    }
  };

  if (isLoadingOrganizations && !contextOrganizations) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' className='justify-start'>
            <div className='bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <ChevronsUpDown className='size-4 animate-pulse' />
            </div>
            <div className='flex flex-col gap-0.5 leading-none'>
              <span className='font-semibold'>AI Guro</span>
              <span className='text-xs'>Загрузка компаний...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (authError && !token) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='text-destructive justify-start'
          >
            <div className='bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <ChevronsUpDown className='size-4' />
            </div>
            <div className='flex flex-col gap-0.5 leading-none'>
              <span className='font-semibold'>AI Guro</span>
              <span className='text-xs'>Ошибка загрузки</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (displayedTenants.length === 0 && !isAddingCompany && !isDeletingCompany) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='cursor-pointer justify-start'
            onClick={() => {
              setIsAddModalOpen(true);
              setAddModalError(null);
              setIsOrgDropdownOpen(false);
            }}
          >
            <div className='bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <ChevronsUpDown className='size-4' />
            </div>
            <div className='flex flex-col gap-0.5 leading-none'>
              <span className='font-semibold'>AI Guro</span>
              <span className='text-xs'>Нет компаний...</span>
            </div>
            <PlusCircle className='text-muted-foreground ml-auto h-4 w-4' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!selectedTenant) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' className='justify-start'>
            <div className='bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <ChevronsUpDown className='size-4' />
            </div>
            <div className='flex flex-col gap-0.5 leading-none'>
              <span className='font-semibold'>AI Guro</span>
              <span className='text-xs'>Выбор компании...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu
            open={isOrgDropdownOpen}
            onOpenChange={setIsOrgDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  {selectedTenant.name
                    ? selectedTenant.name.charAt(0).toUpperCase()
                    : 'G'}
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='font-semibold'>AI Guro</span>
                  <span className=''>{selectedTenant.name}</span>
                </div>
                <ChevronsUpDown className='ml-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width]'
              align='start'
            >
              {displayedTenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  className='group flex cursor-pointer items-center justify-between p-0'
                  onSelect={(e) => {
                    if (
                      !(
                        e.target instanceof HTMLElement &&
                        e.target.closest('button')
                      )
                    ) {
                      handleTenantSwitch(tenant);
                    }
                  }}
                >
                  <span className='flex-grow px-2 py-1.5'>{tenant.name}</span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompanyClick(tenant);
                    }}
                    variant='ghost'
                    size='sm'
                    className='text-destructive hover:bg-destructive ml-auto h-auto p-1 hover:text-white'
                    aria-label={`Delete ${tenant.name}`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                  {selectedTenant && tenant.id === selectedTenant.id && (
                    <Check className='mr-2 ml-auto' />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setIsAddModalOpen(true);
                  setAddModalError(null);
                  setIsOrgDropdownOpen(false);
                }}
                className='cursor-pointer'
              >
                <PlusCircle className='mr-2 h-4 w-4' />
                Добавить компанию
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalError(null);
        }}
        onSubmit={handleAddCompanySubmit}
        isLoading={isAddingCompany}
      />
      {addModalError && isAddModalOpen && (
        <div className='bg-destructive text-destructive-foreground fixed right-4 bottom-4 z-50 rounded-md p-3 shadow-lg'>
          <p>Ошибка: {addModalError}</p>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTenantToDelete(null);
          setDeleteModalError(null);
        }}
        onConfirm={executeDeleteCompany}
        companyName={tenantToDelete?.name}
        isLoading={isDeletingCompany}
      />
      {deleteModalError && isDeleteModalOpen && (
        <div className='bg-destructive text-destructive-foreground fixed right-4 bottom-4 z-50 rounded-md p-3 shadow-lg'>
          <p>Ошибка удаления: {deleteModalError}</p>
        </div>
      )}
    </>
  );
}
