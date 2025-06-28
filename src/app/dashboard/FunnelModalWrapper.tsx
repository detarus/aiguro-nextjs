'use client';

import React, { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';
import AddFunnelModal from './overview/AddFunnelModal';

export default function FunnelModalWrapper() {
  const { organization } = useOrganization();
  const { isAddFunnelModalOpen, closeAddFunnelModal } = usePageHeaderContext();
  const { refreshFunnels, setNewFunnelAsSelected } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );

  // Состояние для формы создания воронки
  const [newFunnelName, setNewFunnelName] = useState('');
  const [stages, setStages] = useState([
    {
      id: Date.now() + Math.random(),
      name: 'Квалификация',
      prompt: '',
      followups: [60]
    },
    {
      id: Date.now() + Math.random() + 1,
      name: 'Презентация',
      prompt: '',
      followups: [60]
    },
    {
      id: Date.now() + Math.random() + 2,
      name: 'Закрытие',
      prompt: '',
      followups: [60]
    }
  ]);
  const [showFollowup, setShowFollowup] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Обработчики для управления этапами
  const handleStageChange = (id: number, field: string, value: string) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, [field]: value } : stage
      )
    );
  };

  const handleAddStage = () => {
    const newStage = {
      id: Date.now() + Math.random(),
      name: '',
      prompt: '',
      followups: [60]
    };
    setStages((prev) => [...prev, newStage]);
  };

  const handleRemoveStage = (id: number) => {
    setStages((prev) => prev.filter((stage) => stage.id !== id));
  };

  const handleAddFollowup = (id: number) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id && stage.followups.length < 3
          ? { ...stage, followups: [...stage.followups, 60] }
          : stage
      )
    );
  };

  const handleRemoveFollowup = (id: number, idx: number) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id
          ? { ...stage, followups: stage.followups.filter((_, i) => i !== idx) }
          : stage
      )
    );
  };

  const handleFollowupChange = (id: number, idx: number, value: number) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id
          ? {
              ...stage,
              followups: stage.followups.map((f, i) => (i === idx ? value : f))
            }
          : stage
      )
    );
  };

  // Обработчик добавления воронки
  const handleAddFunnel = async (newFunnel?: any) => {
    console.log('handleAddFunnel called with:', newFunnel);

    if (newFunnel) {
      // Если передана новая воронка, устанавливаем её как выбранную
      setNewFunnelAsSelected(newFunnel);
    } else {
      // Если воронка не передана, обновляем список воронок
      refreshFunnels();
    }

    // Закрываем модальное окно и сбрасываем форму
    closeAddFunnelModal();
    setNewFunnelName('');
    setStages([
      {
        id: Date.now() + Math.random(),
        name: 'Квалификация',
        prompt: '',
        followups: [60]
      },
      {
        id: Date.now() + Math.random() + 1,
        name: 'Презентация',
        prompt: '',
        followups: [60]
      },
      {
        id: Date.now() + Math.random() + 2,
        name: 'Закрытие',
        prompt: '',
        followups: [60]
      }
    ]);
  };

  return (
    <AddFunnelModal
      isOpen={isAddFunnelModalOpen}
      onClose={closeAddFunnelModal}
      onAdd={handleAddFunnel}
      newFunnelName={newFunnelName}
      setNewFunnelName={setNewFunnelName}
      stages={stages}
      setStages={setStages}
      showFollowup={showFollowup}
      setShowFollowup={setShowFollowup}
      handleStageChange={handleStageChange}
      handleAddStage={handleAddStage}
      handleRemoveStage={handleRemoveStage}
      handleAddFollowup={handleAddFollowup}
      handleRemoveFollowup={handleRemoveFollowup}
      handleFollowupChange={handleFollowupChange}
    />
  );
}
