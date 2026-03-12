import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadReceipt } from '../../api';
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
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      setReceiptFile(null);
    } else {
      setForm((f) => ({ ...f, type: 'expense', category: '', amount: '', description: '', payeeVendor: '', paymentMode: '', approvedBy: '', projectDepartment: '', transactionDetails: '' }));
      setReceiptFile(null);
    }
  }, [editData, isOpen]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'type') setForm((f) => ({ ...f, [name]: value, category: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;

    setUploading(true);
    try {
      let receiptFileId = editData?.receiptFileId || null;

      if (receiptFile) {
        const result = await uploadReceipt(receiptFile);
        receiptFileId = result.s3Key;
      }

      await onSubmit({ ...form, amount: Number(form.amount), createdBy: user, receiptFileId });
    } catch {
      toast.error('Failed to save transaction');
    } finally {
      setUploading(false);
    }
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

            <div className="txn-field">
              <label>Attach Proof / Receipt</label>
              <div className="receipt-upload-area" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                {receiptFile ? (
                  <div className="receipt-selected">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="receipt-file-name">{receiptFile.name}</span>
                    <button type="button" className="receipt-remove-btn" onClick={(e) => { e.stopPropagation(); setReceiptFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : editData?.receiptFileId ? (
                  <div className="receipt-existing">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Proof already attached (click to replace)</span>
                  </div>
                ) : (
                  <div className="receipt-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Click to upload proof (image, PDF, doc)</span>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="txn-submit-btn" disabled={!form.amount || !form.category || !form.date || uploading}>
              {uploading ? 'Uploading...' : editData ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TransactionForm;
