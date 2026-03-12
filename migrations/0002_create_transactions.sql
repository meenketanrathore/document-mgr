CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  payee_vendor TEXT,
  payment_mode TEXT CHECK(payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other')),
  receipt_file_id TEXT,
  approved_by TEXT,
  project_department TEXT,
  transaction_details TEXT,
  created_by TEXT DEFAULT 'Unknown',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
