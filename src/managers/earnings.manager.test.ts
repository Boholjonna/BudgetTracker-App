/**
 * Earnings Manager Unit Tests
 * 
 * Tests for earnings manager functionality
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { earningsManager } from './earnings.manager';
import { storageService } from '../services/storage.service';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    saveEarning: jest.fn(),
    getAllEarnings: jest.fn(),
    deleteEarnings: jest.fn(),
  },
}));

// Mock uuid
jest.mock('../utils/uuid', () => ({
  generateUUID: jest.fn(() => 'test-uuid-1234'),
}));

describe('EarningsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date.now mock
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addEarning', () => {
    it('should add a valid earning and return the entry', async () => {
      const amount = 100.50;
      
      const result = await earningsManager.addEarning(amount);

      expect(result).toEqual({
        id: 'test-uuid-1234',
        amount: 100.50,
        timestamp: 1234567890000,
      });

      expect(storageService.saveEarning).toHaveBeenCalledWith({
        id: 'test-uuid-1234',
        amount: 100.50,
        timestamp: 1234567890000,
      });
    });

    it('should reject invalid amount (zero)', async () => {
      await expect(earningsManager.addEarning(0)).rejects.toThrow(
        'Amount must be greater than zero'
      );

      expect(storageService.saveEarning).not.toHaveBeenCalled();
    });

    it('should reject invalid amount (negative)', async () => {
      await expect(earningsManager.addEarning(-50)).rejects.toThrow(
        'Amount must be greater than zero'
      );

      expect(storageService.saveEarning).not.toHaveBeenCalled();
    });

    it('should generate unique IDs for each earning', async () => {
      const { generateUUID } = require('../utils/uuid');
      generateUUID.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');

      const result1 = await earningsManager.addEarning(100);
      const result2 = await earningsManager.addEarning(200);

      expect(result1.id).toBe('uuid-1');
      expect(result2.id).toBe('uuid-2');
      expect(result1.id).not.toBe(result2.id);
    });

    it('should generate timestamps for each earning', async () => {
      const dateSpy = jest.spyOn(Date, 'now');
      dateSpy.mockReturnValueOnce(1000000000000).mockReturnValueOnce(2000000000000);

      const result1 = await earningsManager.addEarning(100);
      const result2 = await earningsManager.addEarning(200);

      expect(result1.timestamp).toBe(1000000000000);
      expect(result2.timestamp).toBe(2000000000000);
    });

    it('should handle decimal amounts correctly', async () => {
      const amount = 123.45;
      
      const result = await earningsManager.addEarning(amount);

      expect(result.amount).toBe(123.45);
      expect(storageService.saveEarning).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 123.45 })
      );
    });
  });

  describe('validateAmount', () => {
    it('should validate positive number strings', () => {
      const result = earningsManager.validateAmount('100.50');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty strings', () => {
      const result = earningsManager.validateAmount('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount cannot be empty');
    });

    it('should reject non-numeric strings', () => {
      const result = earningsManager.validateAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a valid number');
    });

    it('should reject zero', () => {
      const result = earningsManager.validateAmount('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });

    it('should reject negative numbers', () => {
      const result = earningsManager.validateAmount('-50');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });
  });

  describe('getTotalEarnings', () => {
    it('should return sum of all earnings', async () => {
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        { id: '1', amount: 100, timestamp: 1000 },
        { id: '2', amount: 200, timestamp: 2000 },
        { id: '3', amount: 50.50, timestamp: 3000 },
      ]);

      const total = await earningsManager.getTotalEarnings();

      expect(total).toBe(350.50);
    });

    it('should return 0 for empty earnings list', async () => {
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([]);

      const total = await earningsManager.getTotalEarnings();

      expect(total).toBe(0);
    });

    it('should handle single earning', async () => {
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        { id: '1', amount: 123.45, timestamp: 1000 },
      ]);

      const total = await earningsManager.getTotalEarnings();

      expect(total).toBe(123.45);
    });
  });
});
