import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Login.css';

const USERS = [
  'Chemendra',
  'Meenketan',
  'Chandresh',
  'Harish',
  'Mukesh',
  'Yogendra',
  'Pankaj',
  'Panna',
  'Prawesh',
];

function Login({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    if (password !== 'admin') {
      toast.error('Incorrect password');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    onLogin(selectedUser);
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <motion.div
        className={`login-card ${shaking ? 'shake' : ''}`}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          className="login-logo"
          src="/logo.png"
          alt="Bandhanam Private Limited"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        />
        <h2 className="login-title">Bandhanam Management</h2>
        <p className="login-subtitle">Sign in to manage documents and accounts</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="userSelect" className="login-label">Select User</label>
            <div className="select-wrapper">
              <select
                id="userSelect"
                className="login-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="" disabled>Choose your name...</option>
                {USERS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <motion.button
            type="submit"
            className="login-btn"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            disabled={!selectedUser || !password}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
