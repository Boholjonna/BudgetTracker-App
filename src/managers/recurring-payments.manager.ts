/**
 * Recurring Payments Manager
 * 
 * Manages recurring payment operations including CRUD and daily impact calculations.
 */

import { RecurringPayment } from '../models';
import { storageService } from '../services/storage.service';
import { generateUUID } from '../utils';

/**
 * Frequency to days mapping
 */
const FREQUENCY_DAYS: Record<RecurringPayment['frequency'], number> = {
  'weekly': 7,
  'bi-weekly': 14,
  'monthly': 30,
  'quarterly': 90,
  'yearly': 365,
};

/**
 * Recurring Payments Manager
 */
class RecurringPaymentsManager {
  /**
   * Add a new recurring payment
   */
  async addPayment(
    name: string,
    amount: number,
    frequency: RecurringPayment['frequency'],
    category: string
  ): Promise<RecurringPayment> {
    // Calculate next due date
    const now = Date.now();
    const daysUntilDue = FREQUENCY_DAYS[frequency];
    const nextDueDate = now + (daysUntilDue * 24 * 60 * 60 * 1000);

    const payment: RecurringPayment = {
      id: generateUUID(),
      name,
      amount,
      frequency,
      nextDueDate,
      category,
      createdAt: now,
    };

    await storageService.saveRecurringPayment(payment);
    return payment;
  }

  /**
   * Get all recurring payments
   */
  async getAllPayments(): Promise<RecurringPayment[]> {
    return await storageService.getAllRecurringPayments();
  }

  /**
   * Delete a recurring payment
   */
  async deletePayment(id: string): Promise<void> {
    await storageService.deleteRecurringPayment(id);
  }

  /**
   * Update a recurring payment
   */
  async updatePayment(payment: RecurringPayment): Promise<void> {
    await storageService.updateRecurringPayment(payment);
  }

  /**
   * Calculate daily impact of a single payment
   */
  getDailyImpact(amount: number, frequency: RecurringPayment['frequency']): number {
    const days = FREQUENCY_DAYS[frequency];
    return amount / days;
  }

  /**
   * Calculate total daily impact from all payments
   */
  async getTotalDailyImpact(): Promise<number> {
    const payments = await this.getAllPayments();
    return payments.reduce((total, payment) => {
      return total + this.getDailyImpact(payment.amount, payment.frequency);
    }, 0);
  }

  /**
   * Calculate total monthly impact from all payments
   */
  async getTotalMonthlyImpact(): Promise<number> {
    const dailyImpact = await this.getTotalDailyImpact();
    return dailyImpact * 30;
  }

  /**
   * Calculate total weekly impact from all payments
   */
  async getTotalWeeklyImpact(): Promise<number> {
    const dailyImpact = await this.getTotalDailyImpact();
    return dailyImpact * 7;
  }
}

/**
 * Singleton instance
 */
export const recurringPaymentsManager = new RecurringPaymentsManager();
