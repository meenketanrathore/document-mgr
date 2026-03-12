import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./s3', () => ({
  listFiles: vi.fn().mockResolvedValue([]),
  getDownloadUrl: vi.fn().mockResolvedValue('https://example.com/file'),
  deleteFile: vi.fn().mockResolvedValue(true),
  renameFile: vi.fn().mockResolvedValue({}),
  uploadFile: vi.fn().mockResolvedValue({}),
}));

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: new Proxy(actual.motion || {}, {
      get(_target, prop) {
        if (typeof prop !== 'string') return undefined;
        return ({ children, ...props }) => {
          const clean = { ...props };
          const stripKeys = [
            'whileHover', 'whileTap', 'whileInView',
            'animate', 'initial', 'exit', 'variants',
            'transition', 'layout',
          ];
          stripKeys.forEach((k) => delete clean[k]);
          const Tag = prop;
          return <Tag {...clean}>{children}</Tag>;
        };
      },
    }),
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders the login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('Bandhanam Management')).toBeInTheDocument();
    expect(screen.getByText('Sign in to manage documents and accounts')).toBeInTheDocument();
    expect(screen.getByLabelText('Select User')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders all user options in the dropdown', () => {
    render(<App />);
    const select = screen.getByLabelText('Select User');
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(10);
    expect(screen.getByText('Meenketan')).toBeInTheDocument();
    expect(screen.getByText('Chemendra')).toBeInTheDocument();
    expect(screen.getByText('Prawesh')).toBeInTheDocument();
  });

  it('renders the main app when user is in session', () => {
    sessionStorage.setItem('bandhanam_user', 'Meenketan');
    render(<App />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText(/My Documents/)).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText(/Bandhanam Private Limited/)).toBeInTheDocument();
  });
});
