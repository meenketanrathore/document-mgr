import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TransactionForm.css';

const INCOME_CATEGORIES = ['Sales', 'Services', 'Investment Returns', 'Consulting', 'Other Income'];
const EXPENSE_CATEGORIES = ['Rent', 'Salaries', 'Travel', 'Utilities', 'Office Supplies', 'Legal', 'Marketing', 'Maintenance', 'Miscellaneous'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];
const USERS = ['Chemendra', 'Meenketan', 'Chandresh', 'Harish', 'Mukesh', 'Yogendra', 'Pankaj', 'Panna', 'Prawesh'];

function TransactionForm({ isOpen, onClose, onSubmit, editData, user }) {
  const [form, setForm] = useState({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    payeeVendor: '',
    paymentMode: '',
    approvedBy: '',
    projectDepartment: '',
    transactionDetails: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        type: editData.type || 'expense',
        date: editData.date || new Date().toISOString().split('T')[0],
        amount: editData.amount || '',
        category: editData.category || '',
        description: editData.description || '',
        payeeVendor: editData.payeeVendor || '',
        paymentMode: editData.paymentMode || '',
        approvedBy: editData.approvedBy || '',
        projectDepartment: editData.projectDepartment || '',
        transactionDetails: editData.transactionDetails || '',
      });
    } else {
      setForm((f) => ({ ...f, type: 'expense', category: '', amount: '', description: '', payeeVendor: '', paymentMode: '', approvedBy: '', projectDepartment: '', transactionDetails: '' }));
    }
  }, [editData, isOpen]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'type') setForm((f) => ({ ...f, [name]: value, category: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;
    onSubmit({ ...form, amount: Number(form.amount), createdBy: user });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="txn-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="txn-form-modal"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="txn-form-header">
            <h3>{editData ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <button className="txn-form-close" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form className="txn-form-body" onSubmit={handleSubmit}>
            <div className="txn-type-toggle">
              <button type="button" className={`type-btn ${form.type === 'income' ? 'active income' : ''}`} onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}>Income</button>
              <button type="button" className={`type-btn ${form.type === 'expense' ? 'active expense' : ''}`} onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}>Expense</button>
            </div>

            <div className="txn-form-row">
              <div className="txn-field">
                <label>Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="txn-field">
                <label>Amount (INR) *</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
              </div>
            </div>

            <div className="txn-form-row">
              <div className="txn-field">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="" disabled>Select category...</option>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div className="txn-field">
                <label>Payment Mode</label>
                <select name="paymentMode" value={form.paymentMode} onChange={handleChange}>
                  <option value="">Select...</option>
                  {PAYMENT_MODES.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            </div>

            <div className="txn-field">
              <label>Description</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Brief description" />
            </div>

            <div className="txn-form-row">
              <div className="txn-field">
                <label>Payee / Vendor</label>
                <input type="text" name="payeeVendor" value={form.payeeVendor} onChange={handleChange} placeholder="Name of payee or vendor" />
              </div>
              <div className="txn-field">
                <label>Project / Department</label>
                <input type="text" name="projectDepartment" value={form.projectDepartment} onChange={handleChange} placeholder="Project or department" />
              </div>
            </div>

            <div className="txn-form-row">
              <div className="txn-field">
                <label>Approved By</label>
                <select name="approvedBy" value={form.approvedBy} onChange={handleChange}>
                  <option value="">Select...</option>
                  {USERS.map((u) => (<option key={u} value={u}>{u}</option>))}
                </select>
              </div>
              <div className="txn-field">
                <label>Transaction Details</label>
                <input type="text" name="transactionDetails" value={form.transactionDetails} onChange={handleChange} placeholder="Additional details" />
              </div>
            </div>

            <button type="submit" className="txn-submit-btn" disabled={!form.amount || !form.category || !form.date}>
              {editData ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TransactionForm;
