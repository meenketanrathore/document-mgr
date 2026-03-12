import { getTransactionById, updateTransaction, deleteTransaction, toTransactionClientFormat } from '../../_lib/db.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const existing = await getTransactionById(id);
      if (!existing) return res.status(404).json({ error: 'Transaction not found' });

      const body = req.body;
      const fields = {};
      if (body.type !== undefined) fields.type = body.type;
      if (body.date !== undefined) fields.date = body.date;
      if (body.amount !== undefined) fields.amount = Number(body.amount);
      if (body.category !== undefined) fields.category = body.category;
      if (body.description !== undefined) fields.description = body.description;
      if (body.payeeVendor !== undefined) fields.payee_vendor = body.payeeVendor;
      if (body.paymentMode !== undefined) fields.payment_mode = body.paymentMode;
      if (body.receiptFileId !== undefined) fields.receipt_file_id = body.receiptFileId;
      if (body.approvedBy !== undefined) fields.approved_by = body.approvedBy;
      if (body.projectDepartment !== undefined) fields.project_department = body.projectDepartment;
      if (body.transactionDetails !== undefined) fields.transaction_details = body.transactionDetails;

      await updateTransaction(id, fields);
      const updated = await getTransactionById(id);
      return res.status(200).json(toTransactionClientFormat(updated));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await getTransactionById(id);
      if (!existing) return res.status(404).json({ error: 'Transaction not found' });

      await deleteTransaction(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
