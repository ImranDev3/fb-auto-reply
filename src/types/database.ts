/**
 * AutoReply Pro - Database Schema Types
 * MongoDB/Mongoose schema type definitions
 */

import { Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin: Date | null;
  pageDetails: {
    pageName: string;
    pageId: string;
    pageAccessToken: string;
    whatsappPhoneNumberId: string;
    whatsappAccessToken: string;
  };
  businessDetails: {
    businessName: string;
    category: string;
    description: string;
    address: string;
    phone: string;
    website: string;
    facebookPage: string;
    whatsappNumber: string;
  };
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    maxRules: number;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
    couponUsed: string;
    paymentMethod: string;
    amount: number;
    transactionId: string;
  };
  messageStats: {
    totalReceived: number;
    totalReplied: number;
    lastMessageAt: Date | null;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  keyword: string;
  reply: string;
  platform: 'both' | 'messenger' | 'whatsapp';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  aiContext: string;
  defaultReply: string;
  isAutoReplyEnabled: boolean;
  isAwayMode: boolean;
  awayMessage: string;
  greetingMessage: string;
  isGreetingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description: string;
  price: string;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponDocument extends Document {
  _id: Types.ObjectId;
  code: string;
  discount: number;
  plan: 'all' | 'starter' | 'pro' | 'enterprise';
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Query helpers
export interface UserQueryHelpers {
  byEmail(email: string): any;
  byRole(role: string): any;
  active(): any;
}

export interface RuleQueryHelpers {
  byUser(userId: Types.ObjectId): any;
  active(): any;
  byPlatform(platform: string): any;
}
