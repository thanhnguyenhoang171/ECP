export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
export type PromotionStatus = 'ACTIVE' | 'EXPIRED' | 'SCHEDULED' | 'DISABLED';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number; // % hoặc số tiền
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt: string;
}

export interface PromotionStats {
  activePromotions: number;
  totalVouchersUsed: number;
  totalDiscountAmount: number;
}
