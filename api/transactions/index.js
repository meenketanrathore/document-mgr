import { listTransactions, insertTransaction, toTransactionClientFormat } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { type, month, year, category } = req.query;
      const filters = {};
      if (type) filters.type = type;
      if (month) filters.month = month;
      if (year) filters.year = year;
      if (category) filters.category = category;

      const transactions = await listTransactions(filters);
      return res.status(200).json(transactions);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body.type || !body.date || !body.amount || !body.category) {
        return res.status(400).json({ error: 'type, date, amount, and category are required' });
      }

      const now = new Date().toISOString();
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: body.type,
        date: body.date,
        amount: Number(body.amount),
        category: body.category,
        description: body.description || null,
        payee_vendor: body.payeeVendor || null,
        payment_mode: body.paymentMode || null,
        receipt_file_id: body.receiptFileId || null,
        approved_by: body.approvedBy || null,
        project_department: body.projectDepartment || null,
        transaction_details: body.transactionDetails || null,
        created_by: body.createdBy || 'Unknown',
        created_at: now,
        updated_at: now,
      };

      await insertTransaction(entry);
      return res.status(201).json(toTransactionClientFormat(entry));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
