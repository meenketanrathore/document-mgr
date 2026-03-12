import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './TransactionList.css';

const ALL_CATEGORIES = ['Rent', 'Salaries', 'Travel', 'Utilities', 'Office Supplies', 'Legal', 'Marketing', 'Maintenance', 'Miscellaneous', 'Sales', 'Services', 'Investment Returns', 'Consulting', 'Other Income'];

const CATEGORY_ICONS = {
  Rent: '🏠', Salaries: '💰', Travel: '✈️', Utilities: '💡', 'Office Supplies': '📎',
  Legal: '⚖️', Marketing: '📢', Maintenance: '🔧', Miscellaneous: '📦',
  Sales: '🛒', Services: '🤝', 'Investment Returns': '📈', Consulting: '💼', 'Other Income': '💵',
};

function TransactionList({ transactions, loading, onEdit, onDelete, onFilterChange, filters }) {
  const [confirmId, setConfirmId] = useState(null);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      setConfirmId(null);
      toast.success('Transaction deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="txn-list-section">
      <div className="txn-list-toolbar">
        <div className="txn-filters">
          <select value={filters.type || ''} onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category || ''} onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}>
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <input type="month" value={filters.yearMonth || ''} onChange={(e) => {
            const val = e.target.value;
            if (val) {
              const [y, m] = val.split('-');
              onFilterChange({ ...filters, year: y, month: m, yearMonth: val });
            } else {
              onFilterChange({ ...filters, year: undefined, month: undefined, yearMonth: undefined });
            }
          }} />
        </div>
      </div>

      {loading ? (
        <div className="txn-loading">
          {[1, 2, 3].map((i) => <div key={i} className="txn-skeleton" />)}
        </div>
      ) : transactions.length === 0 ? (
        <motion.div className="txn-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="txn-empty-icon">📊</div>
          <h3>No transactions found</h3>
          <p>Add your first transaction to start tracking</p>
        </motion.div>
      ) : (
        <div className="txn-items">
          <AnimatePresence>
            {transactions.map((txn) => (
              <motion.div
                key={txn.id}
                className={`txn-card ${txn.type}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="txn-card-left">
                  <span className="txn-card-icon">{CATEGORY_ICONS[txn.category] || '📋'}</span>
                  <div className="txn-card-info">
                    <span className="txn-card-desc">{txn.description || txn.category}</span>
                    <span className="txn-card-meta">
                      {format(new Date(txn.date), 'dd MMM yyyy')}
                      {txn.payeeVendor && ` · ${txn.payeeVendor}`}
                      {txn.projectDepartment && ` · ${txn.projectDepartment}`}
                    </span>
                  </div>
                </div>
                <div className="txn-card-right">
                  <span className={`txn-card-amount ${txn.type}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                  {txn.paymentMode && <span className="txn-card-mode">{txn.paymentMode}</span>}
                  <div className="txn-card-actions">
                    <button className="txn-action-btn edit" onClick={() => onEdit(txn)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {confirmId === txn.id ? (
                      <>
                        <button className="txn-action-btn confirm-del" onClick={() => handleDelete(txn.id)}>Yes</button>
                        <button className="txn-action-btn cancel-del" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button className="txn-action-btn delete" onClick={() => setConfirmId(txn.id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
