'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { Upload, FileText, Folder, Trash2, BarChart3 } from 'lucide-react';
import { useFunnels } from '@/contexts/FunnelsContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/file-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface FileItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  file_size?: number;
  file_url?: string;
}

interface FileListResponse {
  files: FileItem[];
  total: number;
  page: number;
  per_page: number;
}

// Категории файлов
const FILE_CATEGORIES = [
  { value: 'general', label: 'Общая информация' },
  { value: 'catalog', label: 'Каталог услуг' },
  { value: 'dialogue', label: 'Ведение диалога' },
  { value: 'client_work', label: 'Работа с клиентом' }
];

export function FilesDebug() {
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels();

  const [filesData, setFilesData] = useState<FileListResponse | null>(null);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [filesSuccessMessage, setFilesSuccessMessage] = useState<string | null>(
    null
  );

  // Состояния для загрузки файла
  const [uploadData, setUploadData] = useState<any>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна загрузки файла
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: '',
    category: '',
    is_public: false
  });

  // Состояния для удаления файла
  const [deleteData, setDeleteData] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна удаления файла
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string>('');

  // Состояния для статистики файлов
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [statisticsSuccessMessage, setStatisticsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для файлов воронки (GET)
  const [funnelFilesData, setFunnelFilesData] =
    useState<FileListResponse | null>(null);
  const [funnelFilesLoading, setFunnelFilesLoading] = useState(false);
  const [funnelFilesError, setFunnelFilesError] = useState<string | null>(null);
  const [funnelFilesSuccessMessage, setFunnelFilesSuccessMessage] = useState<
    string | null
  >(null);
  const [funnelIdForGet, setFunnelIdForGet] = useState<string>('');

  // Состояния для загрузки файла воронки (POST)
  const [uploadFunnelData, setUploadFunnelData] = useState<any>(null);
  const [uploadFunnelLoading, setUploadFunnelLoading] = useState(false);
  const [uploadFunnelError, setUploadFunnelError] = useState<string | null>(
    null
  );
  const [uploadFunnelSuccessMessage, setUploadFunnelSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна загрузки файла воронки
  const [uploadFunnelModalOpen, setUploadFunnelModalOpen] = useState(false);
  const [uploadFunnelForm, setUploadFunnelForm] = useState({
    file: null as File | null,
    funnelId: '',
    description: '',
    category: '',
    is_public: false
  });

  // Состояния для удаления файла воронки
  const [deleteFunnelFileData, setDeleteFunnelFileData] = useState<any>(null);
  const [deleteFunnelFileLoading, setDeleteFunnelFileLoading] = useState(false);
  const [deleteFunnelFileError, setDeleteFunnelFileError] = useState<
    string | null
  >(null);
  const [deleteFunnelFileSuccessMessage, setDeleteFunnelFileSuccessMessage] =
    useState<string | null>(null);

  // Состояния для модального окна удаления файла воронки
  const [deleteFunnelFileModalOpen, setDeleteFunnelFileModalOpen] =
    useState(false);
  const [deleteFunnelFileId, setDeleteFunnelFileId] = useState<string>('');

  // Состояния для получения URL файла
  const [fileUrlData, setFileUrlData] = useState<any>(null);
  const [fileUrlLoading, setFileUrlLoading] = useState(false);
  const [fileUrlError, setFileUrlError] = useState<string | null>(null);
  const [fileUrlSuccessMessage, setFileUrlSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна получения URL
  const [fileUrlModalOpen, setFileUrlModalOpen] = useState(false);
  const [fileUrlForm, setFileUrlForm] = useState({
    fileId: '',
    expiresIn: '3600'
  });

  // Состояния для присоединения файла к воронке
  const [attachFileData, setAttachFileData] = useState<any>(null);
  const [attachFileLoading, setAttachFileLoading] = useState(false);
  const [attachFileError, setAttachFileError] = useState<string | null>(null);
  const [attachFileSuccessMessage, setAttachFileSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна присоединения файла
  const [attachFileModalOpen, setAttachFileModalOpen] = useState(false);
  const [attachFileId, setAttachFileId] = useState<string>('');

  // Состояния для отсоединения файла от воронки
  const [detachFileData, setDetachFileData] = useState<any>(null);
  const [detachFileLoading, setDetachFileLoading] = useState(false);
  const [detachFileError, setDetachFileError] = useState<string | null>(null);
  const [detachFileSuccessMessage, setDetachFileSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна отсоединения файла
  const [detachFileModalOpen, setDetachFileModalOpen] = useState(false);
  const [detachFileId, setDetachFileId] = useState<string>('');

  // Получаем backend ID для отображения
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Получаем ID текущей воронки (если не "Все воронки")
  const currentFunnelId =
    currentFunnel && currentFunnel.id !== '0' ? String(currentFunnel.id) : null;

  // Автоматически обновляем funnelIdForGet при смене воронки
  useEffect(() => {
    if (currentFunnelId) {
      setFunnelIdForGet(String(currentFunnelId));
    } else {
      setFunnelIdForGet('');
    }
  }, [currentFunnelId]);

  // Очищаем данные при смене организации
  useEffect(() => {
    setFilesData(null);
    setFilesError(null);
    setFilesSuccessMessage(null);
    setUploadData(null);
    setUploadError(null);
    setUploadSuccessMessage(null);
    setDeleteData(null);
    setDeleteError(null);
    setDeleteSuccessMessage(null);
    setStatisticsData(null);
    setStatisticsError(null);
    setStatisticsSuccessMessage(null);
    setFunnelFilesData(null);
    setFunnelFilesError(null);
    setFunnelFilesSuccessMessage(null);
    setUploadFunnelData(null);
    setUploadFunnelError(null);
    setUploadFunnelSuccessMessage(null);
    setDeleteFunnelFileData(null);
    setDeleteFunnelFileError(null);
    setDeleteFunnelFileSuccessMessage(null);
    setFileUrlData(null);
    setFileUrlError(null);
    setFileUrlSuccessMessage(null);
    setAttachFileData(null);
    setAttachFileError(null);
    setAttachFileSuccessMessage(null);
    setDetachFileData(null);
    setDetachFileError(null);
    setDetachFileSuccessMessage(null);
  }, [backendOrgId]);

  // Инициализация формы при открытии модального окна
  const handleOpenUploadModal = () => {
    setUploadForm({
      file: null,
      description: '',
      category: '',
      is_public: false
    });
    setUploadModalOpen(true);
  };

  const handleFetchFiles = async () => {
    console.log('Get Files button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setFilesError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setFilesError('No backend organization ID found in metadata');
      return;
    }

    setFilesLoading(true);
    setFilesError(null);
    setFilesSuccessMessage(null);

    try {
      console.log('Sending request to get files...');

      const response = await fetch(`/api/organization/${backendOrgId}/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched files:', data);

      setFilesData(data);
      setFilesSuccessMessage('Файлы успешно получены!');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setFilesSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching files:', err);
      setFilesError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleUploadFile = async () => {
    console.log('Upload File button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setUploadError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setUploadError('No backend organization ID found in metadata');
      return;
    }

    if (!uploadForm.file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);
    setUploadModalOpen(false);

    try {
      console.log('Uploading file:', uploadForm.file.name);

      // Создаем FormData для multipart/form-data запроса
      const formData = new FormData();
      formData.append('file', uploadForm.file);

      if (uploadForm.description.trim()) {
        formData.append('description', uploadForm.description.trim());
      }

      if (uploadForm.category.trim()) {
        formData.append('category', uploadForm.category.trim());
      }

      formData.append('is_public', uploadForm.is_public.toString());

      const response = await fetch(`/api/organization/${backendOrgId}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Не указываем Content-Type, браузер сам установит multipart/form-data с boundary
        },
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully uploaded file:', data);

      setUploadData(data);
      setUploadSuccessMessage('Файл успешно загружен!');

      // Убираем сообщение об успехе через 5 секунд
      setTimeout(() => {
        setUploadSuccessMessage(null);
      }, 5000);

      // Очищаем форму
      setUploadForm({
        file: null,
        description: '',
        category: '',
        is_public: false
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteFileId('');
    setDeleteModalOpen(true);
  };

  const handleDeleteFile = async () => {
    console.log('Delete File button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setDeleteError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteError('No backend organization ID found in metadata');
      return;
    }

    if (!deleteFileId.trim()) {
      setDeleteError('Please enter a file ID to delete');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccessMessage(null);
    setDeleteModalOpen(false);

    try {
      console.log('Deleting file:', deleteFileId);

      const response = await fetch(
        `/api/organization/${backendOrgId}/files/${deleteFileId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully deleted file:', data);

      setDeleteData(data);
      setDeleteSuccessMessage('Файл успешно удален!');

      // Убираем сообщение об успехе через 5 секунд
      setTimeout(() => {
        setDeleteSuccessMessage(null);
      }, 5000);

      // Очищаем форму
      setDeleteFileId('');

      // Автоматически обновляем список файлов
      handleFetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setDeleteError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFetchStatistics = async () => {
    console.log('Get File Statistics button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setStatisticsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setStatisticsError('No backend organization ID found in metadata');
      return;
    }

    setStatisticsLoading(true);
    setStatisticsError(null);
    setStatisticsSuccessMessage(null);

    try {
      console.log('Sending request to get file statistics...');

      const response = await fetch(
        `/api/organization/${backendOrgId}/files/statistics`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched file statistics:', data);

      setStatisticsData(data);
      setStatisticsSuccessMessage('Статистика успешно получена!');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setStatisticsSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching file statistics:', err);
      setStatisticsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handleFetchFunnelFiles = async () => {
    console.log('Get Funnel Files button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setFunnelFilesError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setFunnelFilesError('No backend organization ID found in metadata');
      return;
    }

    if (!funnelIdForGet || !funnelIdForGet.trim()) {
      setFunnelFilesError('Please enter a funnel ID');
      return;
    }

    setFunnelFilesLoading(true);
    setFunnelFilesError(null);
    setFunnelFilesSuccessMessage(null);

    try {
      console.log('Sending request to get funnel files...');

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${funnelIdForGet}/files`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched funnel files:', data);

      setFunnelFilesData(data);
      setFunnelFilesSuccessMessage('Файлы воронки успешно получены!');

      setTimeout(() => {
        setFunnelFilesSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching funnel files:', err);
      setFunnelFilesError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setFunnelFilesLoading(false);
    }
  };

  const handleOpenUploadFunnelModal = () => {
    setUploadFunnelForm({
      file: null,
      funnelId: currentFunnelId ? String(currentFunnelId) : '',
      description: '',
      category: '',
      is_public: false
    });
    setUploadFunnelModalOpen(true);
  };

  const handleUploadFunnelFile = async () => {
    console.log('Upload Funnel File button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setUploadFunnelError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setUploadFunnelError('No backend organization ID found in metadata');
      return;
    }

    if (!uploadFunnelForm.file) {
      setUploadFunnelError('Please select a file to upload');
      return;
    }

    if (!uploadFunnelForm.funnelId || !uploadFunnelForm.funnelId.trim()) {
      setUploadFunnelError('Please enter a funnel ID');
      return;
    }

    setUploadFunnelLoading(true);
    setUploadFunnelError(null);
    setUploadFunnelSuccessMessage(null);
    setUploadFunnelModalOpen(false);

    try {
      console.log('Uploading funnel file:', uploadFunnelForm.file.name);

      const formData = new FormData();
      formData.append('file', uploadFunnelForm.file);

      if (uploadFunnelForm.description.trim()) {
        formData.append('description', uploadFunnelForm.description.trim());
      }

      if (uploadFunnelForm.category.trim()) {
        formData.append('category', uploadFunnelForm.category.trim());
      }

      formData.append('is_public', uploadFunnelForm.is_public.toString());

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${uploadFunnelForm.funnelId}/files`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully uploaded funnel file:', data);

      setUploadFunnelData(data);
      setUploadFunnelSuccessMessage('Файл воронки успешно загружен!');

      setTimeout(() => {
        setUploadFunnelSuccessMessage(null);
      }, 5000);

      setUploadFunnelForm({
        file: null,
        funnelId: '',
        description: '',
        category: '',
        is_public: false
      });
    } catch (err) {
      console.error('Error uploading funnel file:', err);
      setUploadFunnelError(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setUploadFunnelLoading(false);
    }
  };

  const handleOpenDeleteFunnelFileModal = () => {
    setDeleteFunnelFileId('');
    setDeleteFunnelFileModalOpen(true);
  };

  const handleDeleteFunnelFile = async () => {
    console.log('Delete Funnel File button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setDeleteFunnelFileError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteFunnelFileError('No backend organization ID found in metadata');
      return;
    }

    if (!currentFunnelId) {
      setDeleteFunnelFileError('No funnel selected');
      return;
    }

    if (!deleteFunnelFileId || !deleteFunnelFileId.trim()) {
      setDeleteFunnelFileError('Please select a file to delete');
      return;
    }

    setDeleteFunnelFileLoading(true);
    setDeleteFunnelFileError(null);
    setDeleteFunnelFileSuccessMessage(null);
    setDeleteFunnelFileModalOpen(false);

    try {
      console.log('Deleting funnel file:', deleteFunnelFileId);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${currentFunnelId}/files/${deleteFunnelFileId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully deleted funnel file:', data);

      setDeleteFunnelFileData(data);
      setDeleteFunnelFileSuccessMessage('Файл воронки успешно удален!');

      setTimeout(() => {
        setDeleteFunnelFileSuccessMessage(null);
      }, 5000);

      setDeleteFunnelFileId('');

      // Автоматически обновляем список файлов воронки
      if (funnelIdForGet) {
        handleFetchFunnelFiles();
      }
    } catch (err) {
      console.error('Error deleting funnel file:', err);
      setDeleteFunnelFileError(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setDeleteFunnelFileLoading(false);
    }
  };

  const handleOpenFileUrlModal = () => {
    setFileUrlForm({
      fileId: '',
      expiresIn: '3600'
    });
    setFileUrlModalOpen(true);
  };

  const handleGetFileUrl = async () => {
    console.log('Get File URL button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setFileUrlError('No token available in __session cookie');
      return;
    }

    if (!fileUrlForm.fileId || !fileUrlForm.fileId.trim()) {
      setFileUrlError('Please enter a file ID');
      return;
    }

    setFileUrlLoading(true);
    setFileUrlError(null);
    setFileUrlSuccessMessage(null);
    setFileUrlModalOpen(false);

    try {
      console.log('Getting file URL for:', fileUrlForm.fileId);

      const response = await fetch(
        `/api/files/${fileUrlForm.fileId}/url?expires_in=${fileUrlForm.expiresIn}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched file URL:', data);

      setFileUrlData(data);
      setFileUrlSuccessMessage('URL файла успешно получен!');

      setTimeout(() => {
        setFileUrlSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error getting file URL:', err);
      setFileUrlError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setFileUrlLoading(false);
    }
  };

  const handleOpenAttachFileModal = () => {
    setAttachFileId('');
    setAttachFileModalOpen(true);
  };

  const handleAttachFile = async () => {
    console.log('Attach File button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAttachFileError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAttachFileError('No backend organization ID found in metadata');
      return;
    }

    if (!currentFunnelId) {
      setAttachFileError('No funnel selected');
      return;
    }

    if (!attachFileId || !attachFileId.trim()) {
      setAttachFileError('Please select a file to attach');
      return;
    }

    setAttachFileLoading(true);
    setAttachFileError(null);
    setAttachFileSuccessMessage(null);
    setAttachFileModalOpen(false);

    try {
      console.log('Attaching file to funnel:', attachFileId);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${currentFunnelId}/files/${attachFileId}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully attached file to funnel:', data);

      setAttachFileData(data);
      setAttachFileSuccessMessage('Файл успешно присоединен к воронке!');

      setTimeout(() => {
        setAttachFileSuccessMessage(null);
      }, 5000);

      setAttachFileId('');

      // Автоматически обновляем список файлов воронки
      if (funnelIdForGet) {
        handleFetchFunnelFiles();
      }
    } catch (err) {
      console.error('Error attaching file to funnel:', err);
      setAttachFileError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAttachFileLoading(false);
    }
  };

  const handleOpenDetachFileModal = () => {
    setDetachFileId('');
    setDetachFileModalOpen(true);
  };

  const handleDetachFile = async () => {
    console.log('Detach File button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setDetachFileError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDetachFileError('No backend organization ID found in metadata');
      return;
    }

    if (!currentFunnelId) {
      setDetachFileError('No funnel selected');
      return;
    }

    if (!detachFileId || !detachFileId.trim()) {
      setDetachFileError('Please select a file to detach');
      return;
    }

    setDetachFileLoading(true);
    setDetachFileError(null);
    setDetachFileSuccessMessage(null);
    setDetachFileModalOpen(false);

    try {
      console.log('Detaching file from funnel:', detachFileId);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${currentFunnelId}/files/${detachFileId}/detach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully detached file from funnel:', data);

      setDetachFileData(data);
      setDetachFileSuccessMessage('Файл успешно отсоединен от воронки!');

      setTimeout(() => {
        setDetachFileSuccessMessage(null);
      }, 5000);

      setDetachFileId('');

      // Автоматически обновляем список файлов воронки
      if (funnelIdForGet) {
        handleFetchFunnelFiles();
      }
    } catch (err) {
      console.error('Error detaching file from funnel:', err);
      setDetachFileError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDetachFileLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20'>
      <h3 className='mb-2 font-semibold text-blue-800 dark:text-blue-200'>
        Files Management Debug
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Selected Org ID (Backend):</strong> {backendOrgId || 'None'}
        </p>
        <p>
          <strong>Has Token:</strong>{' '}
          {getClerkTokenFromClientCookie() ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Clerk Org ID:</strong> {organization?.id || 'Not set'}
        </p>
        <p>
          <strong>Organization Loaded:</strong> {organization ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Has Backend ID:</strong> {backendOrgId ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Current Funnel:</strong> {currentFunnel?.name || 'None'}
        </p>
        <p>
          <strong>Current Funnel ID:</strong>{' '}
          {currentFunnelId || 'Not selected'}
        </p>

        {/* Кнопки для API запросов */}
        <div className='mt-4 space-y-2'>
          <Button
            onClick={handleFetchFiles}
            disabled={filesLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <Folder className='mr-2 h-4 w-4' />
            {filesLoading ? 'Loading...' : 'Get Organization Files'}
          </Button>

          <Button
            onClick={handleOpenUploadModal}
            disabled={uploadLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <Upload className='mr-2 h-4 w-4' />
            {uploadLoading ? 'Uploading...' : 'Upload File'}
          </Button>

          <Button
            onClick={handleOpenDeleteModal}
            disabled={deleteLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {deleteLoading ? 'Deleting...' : 'Delete File'}
          </Button>

          <Button
            onClick={handleFetchStatistics}
            disabled={statisticsLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <BarChart3 className='mr-2 h-4 w-4' />
            {statisticsLoading ? 'Loading...' : 'Get File Statistics'}
          </Button>

          {/* Секция файлов воронки - показывается только если выбрана конкретная воронка */}
          {currentFunnelId && (
            <>
              {/* Разделитель для файлов воронки */}
              <div className='my-4 border-t border-blue-300 dark:border-blue-600' />
              <p className='text-xs font-semibold text-blue-700 dark:text-blue-300'>
                Funnel Files ({currentFunnel?.name})
              </p>

              <div className='flex gap-2'>
                <Input
                  value={funnelIdForGet}
                  onChange={(e) => setFunnelIdForGet(e.target.value)}
                  placeholder='Funnel ID'
                  className='flex-1'
                  disabled
                />
                <Button
                  onClick={handleFetchFunnelFiles}
                  disabled={
                    funnelFilesLoading ||
                    !backendOrgId ||
                    !funnelIdForGet ||
                    !funnelIdForGet.trim()
                  }
                  variant='outline'
                  size='sm'
                >
                  <Folder className='mr-2 h-4 w-4' />
                  {funnelFilesLoading ? 'Loading...' : 'Get Funnel Files'}
                </Button>
              </div>

              <Button
                onClick={handleOpenUploadFunnelModal}
                disabled={uploadFunnelLoading || !backendOrgId}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Upload className='mr-2 h-4 w-4' />
                {uploadFunnelLoading ? 'Uploading...' : 'Upload Funnel File'}
              </Button>

              <Button
                onClick={handleOpenDeleteFunnelFileModal}
                disabled={deleteFunnelFileLoading || !backendOrgId}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                {deleteFunnelFileLoading ? 'Deleting...' : 'Delete Funnel File'}
              </Button>

              <Button
                onClick={handleOpenAttachFileModal}
                disabled={attachFileLoading || !backendOrgId}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Upload className='mr-2 h-4 w-4' />
                {attachFileLoading ? 'Attaching...' : 'Attach File To Funnel'}
              </Button>

              <Button
                onClick={handleOpenDetachFileModal}
                disabled={detachFileLoading || !backendOrgId}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                {detachFileLoading ? 'Detaching...' : 'Detach File From Funnel'}
              </Button>
            </>
          )}

          {/* Разделитель для общих функций */}
          <div className='my-4 border-t border-blue-300 dark:border-blue-600' />
          <p className='text-xs font-semibold text-blue-700 dark:text-blue-300'>
            File URL
          </p>

          <Button
            onClick={handleOpenFileUrlModal}
            disabled={fileUrlLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <FileText className='mr-2 h-4 w-4' />
            {fileUrlLoading ? 'Loading...' : 'Get File URL'}
          </Button>
        </div>

        {/* Сообщения об успехе */}
        {filesSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Get Files):</strong> {filesSuccessMessage}
          </div>
        )}

        {uploadSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Upload File):</strong> {uploadSuccessMessage}
          </div>
        )}

        {deleteSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Delete File):</strong> {deleteSuccessMessage}
          </div>
        )}

        {statisticsSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Statistics):</strong> {statisticsSuccessMessage}
          </div>
        )}

        {funnelFilesSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Get Funnel Files):</strong>{' '}
            {funnelFilesSuccessMessage}
          </div>
        )}

        {uploadFunnelSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Upload Funnel File):</strong>{' '}
            {uploadFunnelSuccessMessage}
          </div>
        )}

        {deleteFunnelFileSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Delete Funnel File):</strong>{' '}
            {deleteFunnelFileSuccessMessage}
          </div>
        )}

        {fileUrlSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Get File URL):</strong> {fileUrlSuccessMessage}
          </div>
        )}

        {attachFileSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Attach File):</strong> {attachFileSuccessMessage}
          </div>
        )}

        {detachFileSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Detach File):</strong> {detachFileSuccessMessage}
          </div>
        )}

        {/* Ошибки */}
        {filesError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Get Files):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>{filesError}</pre>
          </div>
        )}

        {uploadError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Upload File):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {uploadError}
            </pre>
          </div>
        )}

        {deleteError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Delete File):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {deleteError}
            </pre>
          </div>
        )}

        {statisticsError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Statistics):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {statisticsError}
            </pre>
          </div>
        )}

        {funnelFilesError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Get Funnel Files):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {funnelFilesError}
            </pre>
          </div>
        )}

        {uploadFunnelError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Upload Funnel File):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {uploadFunnelError}
            </pre>
          </div>
        )}

        {deleteFunnelFileError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Delete Funnel File):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {deleteFunnelFileError}
            </pre>
          </div>
        )}

        {fileUrlError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Get File URL):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {fileUrlError}
            </pre>
          </div>
        )}

        {attachFileError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Attach File):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {attachFileError}
            </pre>
          </div>
        )}

        {detachFileError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Detach File):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {detachFileError}
            </pre>
          </div>
        )}

        {/* Результаты API запросов */}
        {filesData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Files List ({filesData.total} files)
            </summary>
            <div className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
              <div className='mb-2'>
                <strong>Total: {filesData.total} files</strong>
              </div>
              {filesData.files && filesData.files.length > 0 ? (
                <div className='space-y-2'>
                  {filesData.files.map((file: FileItem) => (
                    <div
                      key={file.id}
                      className='rounded bg-white p-2 dark:bg-gray-800'
                    >
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        <strong>{file.name}</strong>
                        {file.is_public && (
                          <span className='rounded bg-green-100 px-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300'>
                            Public
                          </span>
                        )}
                      </div>
                      <div className='text-xs text-blue-600 dark:text-blue-400'>
                        ID: {file.id}
                      </div>
                      {file.description && (
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          {file.description}
                        </div>
                      )}
                      {file.category && (
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          Category: {file.category}
                        </div>
                      )}
                      {file.file_size && (
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          Size: {formatFileSize(file.file_size)}
                        </div>
                      )}
                      <div className='text-xs text-gray-500 dark:text-gray-500'>
                        Created: {new Date(file.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No files found</div>
              )}
            </div>
          </details>
        )}

        {uploadData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Upload File API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(uploadData, null, 2)}
            </pre>
          </details>
        )}

        {deleteData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Delete File API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
              {JSON.stringify(deleteData, null, 2)}
            </pre>
          </details>
        )}

        {statisticsData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View File Statistics
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
              {JSON.stringify(statisticsData, null, 2)}
            </pre>
          </details>
        )}

        {funnelFilesData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Funnel Files List ({funnelFilesData.total} files)
            </summary>
            <div className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
              <div className='mb-2'>
                <strong>Total: {funnelFilesData.total} files</strong>
              </div>
              {funnelFilesData.files && funnelFilesData.files.length > 0 ? (
                <div className='space-y-2'>
                  {funnelFilesData.files.map((file: FileItem) => (
                    <div
                      key={file.id}
                      className='rounded bg-white p-2 dark:bg-gray-800'
                    >
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        <strong>{file.name}</strong>
                        {file.is_public && (
                          <span className='rounded bg-green-100 px-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300'>
                            Public
                          </span>
                        )}
                      </div>
                      <div className='text-xs text-blue-600 dark:text-blue-400'>
                        ID: {file.id}
                      </div>
                      {file.description && (
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          {file.description}
                        </div>
                      )}
                      {file.category && (
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          Category: {file.category}
                        </div>
                      )}
                      {file.file_size && (
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          Size: {formatFileSize(file.file_size)}
                        </div>
                      )}
                      <div className='text-xs text-gray-500 dark:text-gray-500'>
                        Created: {new Date(file.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No files found</div>
              )}
            </div>
          </details>
        )}

        {uploadFunnelData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Upload Funnel File API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(uploadFunnelData, null, 2)}
            </pre>
          </details>
        )}

        {deleteFunnelFileData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Delete Funnel File API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
              {JSON.stringify(deleteFunnelFileData, null, 2)}
            </pre>
          </details>
        )}

        {fileUrlData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View File URL Response
            </summary>
            <div className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
              <pre>{JSON.stringify(fileUrlData, null, 2)}</pre>
              {fileUrlData.url && (
                <div className='mt-2 border-t border-purple-300 pt-2 dark:border-purple-700'>
                  <strong>URL:</strong>
                  <a
                    href={fileUrlData.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-1 block break-all text-blue-600 underline dark:text-blue-400'
                  >
                    {fileUrlData.url}
                  </a>
                </div>
              )}
            </div>
          </details>
        )}

        {attachFileData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Attach File API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(attachFileData, null, 2)}
            </pre>
          </details>
        )}

        {detachFileData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Detach File API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-orange-100 p-2 text-xs dark:bg-orange-900/30 dark:text-orange-200'>
              {JSON.stringify(detachFileData, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Модальное окно загрузки файла */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Загрузить файл организации</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* Файл - компактная версия */}
            <div className='grid gap-2'>
              <Label htmlFor='file'>Файл *</Label>
              <div className='min-h-[120px]'>
                <FileUploader
                  value={uploadForm.file ? [uploadForm.file] : []}
                  onValueChange={(files) => {
                    if (Array.isArray(files) && files.length > 0) {
                      setUploadForm((prev) => ({
                        ...prev,
                        file: files[0]
                      }));
                    } else {
                      setUploadForm((prev) => ({
                        ...prev,
                        file: null
                      }));
                    }
                  }}
                  accept={{ '*': [] }}
                  maxSize={50 * 1024 * 1024} // 50MB
                  maxFiles={1}
                />
              </div>
            </div>

            {/* Две колонки для категории и доступа */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='category'>Категория файла</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      category: value
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите категорию' />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='is_public'>Доступ</Label>
                <div className='flex h-10 items-center space-x-2'>
                  <Switch
                    id='is_public'
                    checked={uploadForm.is_public}
                    onCheckedChange={(checked) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        is_public: checked
                      }))
                    }
                  />
                  <Label htmlFor='is_public' className='cursor-pointer'>
                    Публичный доступ
                  </Label>
                </div>
              </div>
            </div>

            {/* Описание - на всю ширину */}
            <div className='grid gap-2'>
              <Label htmlFor='description'>Описание файла</Label>
              <Textarea
                id='description'
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                placeholder='Введите описание файла'
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setUploadModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleUploadFile}
              disabled={uploadLoading || !uploadForm.file}
            >
              {uploadLoading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно удаления файла */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Удалить файл</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='fileId'>Выберите файл для удаления *</Label>
              {filesData && filesData.files && filesData.files.length > 0 ? (
                <Select value={deleteFileId} onValueChange={setDeleteFileId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите файл' />
                  </SelectTrigger>
                  <SelectContent>
                    {filesData.files.map((file: FileItem) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name} (ID: {file.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                  Сначала загрузите список файлов, нажав кнопку &quot;Get
                  Organization Files&quot;
                </div>
              )}
              <p className='text-xs text-gray-500'>
                {filesData && filesData.files && filesData.files.length > 0
                  ? 'Выберите файл из списка для удаления'
                  : 'Список файлов пуст или не загружен'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleDeleteFile}
              disabled={deleteLoading || !deleteFileId.trim()}
              variant='destructive'
            >
              {deleteLoading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно загрузки файла воронки */}
      <Dialog
        open={uploadFunnelModalOpen}
        onOpenChange={setUploadFunnelModalOpen}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Загрузить файл воронки</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* ID воронки - на всю ширину */}
            <div className='grid gap-2'>
              <Label htmlFor='funnelId'>ID воронки *</Label>
              <Input
                id='funnelId'
                value={uploadFunnelForm.funnelId}
                disabled
                className='bg-gray-50 dark:bg-gray-800'
              />
              <p className='text-xs text-gray-500'>
                Автоматически заполнено из текущей выбранной воронки
              </p>
            </div>

            {/* Файл - компактная версия */}
            <div className='grid gap-2'>
              <Label htmlFor='funnelFile'>Файл *</Label>
              <div className='min-h-[120px]'>
                <FileUploader
                  value={uploadFunnelForm.file ? [uploadFunnelForm.file] : []}
                  onValueChange={(files) => {
                    if (Array.isArray(files) && files.length > 0) {
                      setUploadFunnelForm((prev) => ({
                        ...prev,
                        file: files[0]
                      }));
                    } else {
                      setUploadFunnelForm((prev) => ({
                        ...prev,
                        file: null
                      }));
                    }
                  }}
                  accept={{ '*': [] }}
                  maxSize={50 * 1024 * 1024} // 50MB
                  maxFiles={1}
                />
              </div>
            </div>

            {/* Две колонки для остальных полей */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='funnelCategory'>Категория файла</Label>
                <Select
                  value={uploadFunnelForm.category}
                  onValueChange={(value) =>
                    setUploadFunnelForm((prev) => ({
                      ...prev,
                      category: value
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите категорию' />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='funnelIsPublic'>Доступ</Label>
                <div className='flex h-10 items-center space-x-2'>
                  <Switch
                    id='funnelIsPublic'
                    checked={uploadFunnelForm.is_public}
                    onCheckedChange={(checked) =>
                      setUploadFunnelForm((prev) => ({
                        ...prev,
                        is_public: checked
                      }))
                    }
                  />
                  <Label htmlFor='funnelIsPublic' className='cursor-pointer'>
                    Публичный доступ
                  </Label>
                </div>
              </div>
            </div>

            {/* Описание - на всю ширину */}
            <div className='grid gap-2'>
              <Label htmlFor='funnelDescription'>Описание файла</Label>
              <Textarea
                id='funnelDescription'
                value={uploadFunnelForm.description}
                onChange={(e) =>
                  setUploadFunnelForm((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                placeholder='Введите описание файла'
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setUploadFunnelModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUploadFunnelFile}
              disabled={
                uploadFunnelLoading ||
                !uploadFunnelForm.file ||
                !uploadFunnelForm.funnelId ||
                !uploadFunnelForm.funnelId.trim()
              }
            >
              {uploadFunnelLoading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно удаления файла воронки */}
      <Dialog
        open={deleteFunnelFileModalOpen}
        onOpenChange={setDeleteFunnelFileModalOpen}
      >
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Удалить файл воронки</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='deleteFunnelFileId'>
                Выберите файл для удаления *
              </Label>
              {funnelFilesData &&
              funnelFilesData.files &&
              funnelFilesData.files.length > 0 ? (
                <Select
                  value={deleteFunnelFileId}
                  onValueChange={setDeleteFunnelFileId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите файл' />
                  </SelectTrigger>
                  <SelectContent>
                    {funnelFilesData.files.map((file: FileItem) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name} (ID: {file.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                  Сначала загрузите список файлов воронки, нажав кнопку
                  &quot;Get Funnel Files&quot;
                </div>
              )}
              <p className='text-xs text-gray-500'>
                {funnelFilesData &&
                funnelFilesData.files &&
                funnelFilesData.files.length > 0
                  ? 'Выберите файл из списка для удаления'
                  : 'Список файлов воронки пуст или не загружен'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteFunnelFileModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDeleteFunnelFile}
              disabled={
                deleteFunnelFileLoading ||
                !deleteFunnelFileId ||
                !deleteFunnelFileId.trim()
              }
              variant='destructive'
            >
              {deleteFunnelFileLoading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно получения URL файла */}
      <Dialog open={fileUrlModalOpen} onOpenChange={setFileUrlModalOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Получить URL файла</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='fileUrlId'>ID файла *</Label>
              <Input
                id='fileUrlId'
                value={fileUrlForm.fileId}
                onChange={(e) =>
                  setFileUrlForm((prev) => ({
                    ...prev,
                    fileId: e.target.value
                  }))
                }
                placeholder='Введите ID файла'
              />
              <p className='text-xs text-gray-500'>
                ID файла можно найти в списке файлов выше
              </p>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='expiresIn'>Время жизни ссылки (секунды)</Label>
              <Input
                id='expiresIn'
                type='number'
                value={fileUrlForm.expiresIn}
                onChange={(e) =>
                  setFileUrlForm((prev) => ({
                    ...prev,
                    expiresIn: e.target.value
                  }))
                }
                placeholder='3600'
              />
              <p className='text-xs text-gray-500'>
                По умолчанию: 3600 секунд (1 час)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setFileUrlModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleGetFileUrl}
              disabled={
                fileUrlLoading ||
                !fileUrlForm.fileId ||
                !fileUrlForm.fileId.trim()
              }
            >
              {fileUrlLoading ? 'Загрузка...' : 'Получить URL'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно присоединения файла к воронке */}
      <Dialog open={attachFileModalOpen} onOpenChange={setAttachFileModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Присоединить файл к воронке</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='attachFileId'>Выберите файл организации *</Label>
              {filesData && filesData.files && filesData.files.length > 0 ? (
                <Select value={attachFileId} onValueChange={setAttachFileId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите файл' />
                  </SelectTrigger>
                  <SelectContent>
                    {filesData.files.map((file: FileItem) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name} (ID: {file.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                  Сначала загрузите список файлов организации, нажав кнопку
                  &quot;Get Organization Files&quot;
                </div>
              )}
              <p className='text-xs text-gray-500'>
                {filesData && filesData.files && filesData.files.length > 0
                  ? 'Выберите файл из списка файлов организации для присоединения к воронке'
                  : 'Список файлов организации пуст или не загружен'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setAttachFileModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleAttachFile}
              disabled={
                attachFileLoading || !attachFileId || !attachFileId.trim()
              }
            >
              {attachFileLoading ? 'Присоединение...' : 'Присоединить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно отсоединения файла от воронки */}
      <Dialog open={detachFileModalOpen} onOpenChange={setDetachFileModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Отсоединить файл от воронки</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='detachFileId'>Выберите файл воронки *</Label>
              {funnelFilesData &&
              funnelFilesData.files &&
              funnelFilesData.files.length > 0 ? (
                <Select value={detachFileId} onValueChange={setDetachFileId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите файл' />
                  </SelectTrigger>
                  <SelectContent>
                    {funnelFilesData.files.map((file: FileItem) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name} (ID: {file.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                  Сначала загрузите список файлов воронки, нажав кнопку
                  &quot;Get Funnel Files&quot;
                </div>
              )}
              <p className='text-xs text-gray-500'>
                {funnelFilesData &&
                funnelFilesData.files &&
                funnelFilesData.files.length > 0
                  ? 'Выберите файл из списка файлов воронки для отсоединения'
                  : 'Список файлов воронки пуст или не загружен'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDetachFileModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDetachFile}
              disabled={
                detachFileLoading || !detachFileId || !detachFileId.trim()
              }
              variant='destructive'
            >
              {detachFileLoading ? 'Отсоединение...' : 'Отсоединить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
