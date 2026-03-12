import { motion } from 'framer-motion';
import './Header.css';

function Header({ user, onLogout }) {
  return (
    <motion.header
      className="header"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="header-inner">
        <div className="logo-group">
          <motion.img
            className="logo-img"
            src="/logo.png"
            alt="Bandhanam Private Limited"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <div className="logo-text">
            <span className="logo-subtitle">Management Application</span>
          </div>
        </div>

        <div className="header-right">
          {user && (
            <motion.div
              className="user-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <span className="user-avatar">{user.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user}</span>
              <button className="logout-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
