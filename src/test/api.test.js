import { describe, it, expect } from 'vitest';
import * as api from '../api';

describe('API Module Exports', () => {
  it('should export listFiles function', () => {
    expect(typeof api.listFiles).toBe('function');
  });

  it('should export uploadFile function', () => {
    expect(typeof api.uploadFile).toBe('function');
  });

  it('should export getDownloadUrl function', () => {
    expect(typeof api.getDownloadUrl).toBe('function');
  });

  it('should export renameFile function', () => {
    expect(typeof api.renameFile).toBe('function');
  });

  it('should export deleteFile function', () => {
    expect(typeof api.deleteFile).toBe('function');
  });

  it('should export syncFiles function', () => {
    expect(typeof api.syncFiles).toBe('function');
  });

  it('should export listTransactions function', () => {
    expect(typeof api.listTransactions).toBe('function');
  });

  it('should export createTransaction function', () => {
    expect(typeof api.createTransaction).toBe('function');
  });

  it('should export updateTransaction function', () => {
    expect(typeof api.updateTransaction).toBe('function');
  });

  it('should export deleteTransaction function', () => {
    expect(typeof api.deleteTransaction).toBe('function');
  });

  it('should export getTransactionSummary function', () => {
    expect(typeof api.getTransactionSummary).toBe('function');
  });
});
