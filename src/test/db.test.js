import { describe, it, expect } from 'vitest';
import { toClientFormat, toTransactionClientFormat } from '../../api/_lib/db.js';

describe('Turso Database Helpers', () => {
  it('toClientFormat should map snake_case DB rows to camelCase client objects', () => {
    const row = {
      id: 'test-1',
      display_name: 'Test Document',
      original_name: 'test.pdf',
      s3_key: 'uploads/12345_test.pdf',
      content_type: 'application/pdf',
      size: 1024,
      uploaded_at: '2026-03-11T10:00:00.000Z',
      uploaded_by: 'TestUser',
      last_updated_by: 'TestUser',
      last_updated_at: '2026-03-11T10:00:00.000Z',
    };

    const result = toClientFormat(row);

    expect(result.id).toBe('test-1');
    expect(result.displayName).toBe('Test Document');
    expect(result.originalName).toBe('test.pdf');
    expect(result.s3Key).toBe('uploads/12345_test.pdf');
    expect(result.contentType).toBe('application/pdf');
    expect(result.size).toBe(1024);
    expect(result.uploadedAt).toBe('2026-03-11T10:00:00.000Z');
    expect(result.uploadedBy).toBe('TestUser');
    expect(result.lastUpdatedBy).toBe('TestUser');
    expect(result.lastUpdatedAt).toBe('2026-03-11T10:00:00.000Z');
  });

  it('toClientFormat should not include snake_case keys', () => {
    const row = {
      id: 'x',
      display_name: 'n',
      original_name: 'o',
      s3_key: 'k',
      content_type: 'ct',
      size: 0,
      uploaded_at: '',
      uploaded_by: '',
      last_updated_by: '',
      last_updated_at: '',
    };

    const result = toClientFormat(row);
    expect(result).not.toHaveProperty('display_name');
    expect(result).not.toHaveProperty('original_name');
    expect(result).not.toHaveProperty('s3_key');
    expect(result).not.toHaveProperty('content_type');
    expect(result).not.toHaveProperty('uploaded_at');
    expect(result).not.toHaveProperty('uploaded_by');
    expect(result).not.toHaveProperty('last_updated_by');
    expect(result).not.toHaveProperty('last_updated_at');
  });
});

describe('Transaction Helpers', () => {
  it('toTransactionClientFormat maps snake_case to camelCase', () => {
    const row = {
      id: 'txn-1',
      type: 'expense',
      date: '2026-03-10',
      amount: 1500,
      category: 'Rent',
      description: 'Office rent',
      payee_vendor: 'Landlord',
      payment_mode: 'Bank Transfer',
      receipt_file_id: null,
      approved_by: 'Chemendra',
      project_department: 'Admin',
      transaction_details: 'Monthly rent',
      created_by: 'Meenketan',
      created_at: '2026-03-10T10:00:00.000Z',
      updated_at: '2026-03-10T10:00:00.000Z',
    };

    const result = toTransactionClientFormat(row);

    expect(result.id).toBe('txn-1');
    expect(result.type).toBe('expense');
    expect(result.amount).toBe(1500);
    expect(result.payeeVendor).toBe('Landlord');
    expect(result.paymentMode).toBe('Bank Transfer');
    expect(result.approvedBy).toBe('Chemendra');
    expect(result.projectDepartment).toBe('Admin');
    expect(result.createdBy).toBe('Meenketan');
    expect(result).not.toHaveProperty('payee_vendor');
    expect(result).not.toHaveProperty('payment_mode');
    expect(result).not.toHaveProperty('receipt_file_id');
    expect(result).not.toHaveProperty('approved_by');
    expect(result).not.toHaveProperty('project_department');
    expect(result).not.toHaveProperty('created_by');
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
  });
});
