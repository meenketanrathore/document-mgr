const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function listFiles() {
  const res = await fetch(`${API_BASE}/files`);
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}

export async function uploadFile(file, displayName, userName, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayName', displayName);
    formData.append('userName', userName || 'Unknown');

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const body = JSON.parse(xhr.responseText || '{}');
        reject(new Error(body.error || 'Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', `${API_BASE}/files/upload`);
    xhr.send(formData);
  });
}

export async function getDownloadUrl(id) {
  const res = await fetch(`${API_BASE}/files/${id}/download`);
  if (!res.ok) throw new Error('Failed to get download URL');
  const data = await res.json();
  return data.url;
}

export async function renameFile(id, newName, userName) {
  const res = await fetch(`${API_BASE}/files/${id}/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newName, userName }),
  });
  if (!res.ok) throw new Error('Rename failed');
  return res.json();
}

export async function deleteFile(id) {
  const res = await fetch(`${API_BASE}/files/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function syncFiles() {
  const res = await fetch(`${API_BASE}/files/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Sync failed');
  return res.json();
}

// --- Transaction API ---

export async function listTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.month) params.set('month', filters.month);
  if (filters.year) params.set('year', filters.year);
  if (filters.category) params.set('category', filters.category);
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/transactions${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function createTransaction(data) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
}

export async function updateTransaction(id, data) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return res.json();
}

export async function getTransactionSummary(year) {
  const params = year ? `?year=${year}` : '';
  const res = await fetch(`${API_BASE}/transactions/summary${params}`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}
