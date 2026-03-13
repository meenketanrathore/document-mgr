import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SummaryCards from './SummaryCards';
import AccountsCharts from './AccountsCharts';
import ExpenseSplit from './ExpenseSplit';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import { listTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionSummary } from '../../api';
import { exportToExcel, exportToPDF } from './exportTransactions';
import './AccountsPage.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function AccountsPage({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filters, setFilters] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [txns, sum] = await Promise.all([
        listTransactions(filters),
        getTransactionSummary(year),
      ]);
      setTransactions(txns);
      setSummary(sum);
    } catch {
      toast.error('Failed to load accounts data');
    } finally {
      setLoading(false);
    }
  }, [filters, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        await updateTransaction(editData.id, formData);
        toast.success('Transaction updated');
      } else {
        await createTransaction(formData);
        toast.success('Transaction added');
      }
      setFormOpen(false);
      setEditData(null);
      fetchData();
    } catch {
      toast.error('Failed to save transaction');
    }
  };

  const handleEdit = (txn) => {
    setEditData(txn);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    fetchData();
  };

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  return (
    <motion.div className="accounts-page" variants={pageVariants} initial="initial" animate="animate">
      <div className="accounts-header-row">
        <div className="accounts-year-picker">
          <button onClick={() => setYear((y) => y - 1)} className="year-nav-btn" aria-label="Previous year">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="year-label">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="year-nav-btn" aria-label="Next year">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
        <div className="accounts-actions">
          <motion.button className="add-txn-btn" onClick={handleAdd} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </motion.button>
          <div className="export-btns">
            <button
              className="export-btn excel"
              onClick={() => { exportToExcel(transactions, `Transactions_${year}`); toast.success('Excel exported'); }}
              disabled={transactions.length === 0}
              title="Export to Excel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Excel
            </button>
            <button
              className="export-btn pdf"
              onClick={() => { exportToPDF(transactions, `Transactions_${year}`); toast.success('PDF exported'); }}
              disabled={transactions.length === 0}
              title="Export to PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <h3 className="section-heading">Transactions</h3>
      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilterChange={setFilters}
        filters={filters}
      />

      <AccountsCharts summary={summary} />

      <ExpenseSplit summary={summary} />

      <TransactionForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        user={user}
      />
    </motion.div>
  );
}

export default AccountsPage;
