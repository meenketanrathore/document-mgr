import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import FloatingParticles from './components/FloatingParticles';
import Login from './components/Login';
import AccountsPage from './components/Accounts/AccountsPage';
import { listFiles } from './api';
import { useFilePolling } from './hooks/useFileEvents';
import './App.css';

function App() {
  const [user, setUser] = useState(() => sessionStorage.getItem('bandhanam_user') || '');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('files');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (username) => {
    setUser(username);
    sessionStorage.setItem('bandhanam_user', username);
  };

  const handleLogout = () => {
    setUser('');
    sessionStorage.removeItem('bandhanam_user');
  };

  const fetchFiles = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await listFiles();
      setFiles(data);
    } catch {
      if (showLoading) setFiles([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchFiles();
  }, [fetchFiles, user]);

  useFilePolling(fetchFiles);

  if (!user) {
    return (
      <div className="app">
        <FloatingParticles />
        <Login onLogin={handleLogin} />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
          }}
        />
      </div>
    );
  }

  const filteredFiles = files.filter(
    (f) =>
      f.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <FloatingParticles />
      <Header user={user} onLogout={handleLogout} />

      <main className="main-content">
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
          <button
            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('files');
              fetchFiles();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            My Documents
            {files.length > 0 && <span className="badge">{files.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Accounts
          </button>
        </nav>

        <div className="tab-content" style={{ display: activeTab === 'upload' ? 'block' : 'none' }}>
          <FileUpload
            user={user}
            onUploadComplete={async (newFile) => {
              if (newFile) {
                setFiles((prev) => {
                  const exists = prev.some((f) => f.id === newFile.id);
                  return exists ? prev : [newFile, ...prev];
                });
              }
              setActiveTab('files');
            }}
          />
        </div>
        <div className="tab-content" style={{ display: activeTab === 'files' ? 'block' : 'none' }}>
          <FileList
            files={filteredFiles}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={fetchFiles}
            onDelete={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            onRename={(id, newName, updatedBy) =>
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === id ? { ...f, displayName: newName, lastUpdatedBy: updatedBy } : f
                )
              )
            }
            user={user}
          />
        </div>
        <div className="tab-content" style={{ display: activeTab === 'accounts' ? 'block' : 'none' }}>
          <AccountsPage user={user} />
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Bandhanam Private Limited. All rights reserved.</p>
      </footer>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
        }}
      />
    </div>
  );
}

export default App;
