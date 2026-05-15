/**
 * AutoReply Pro - Type Definitions
 * TypeScript interfaces for the application
 */

// User Interface
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin: Date | null;
  pageDetails: IPageDetails;
  businessDetails: IBusinessDetails;
  subscription: ISubscription;
  messageStats: IMessageStats;
  createdAt: Date;
  updatedAt: Date;
}

// Page Details
export interface IPageDetails {
  pageName: string;
  pageId: string;
  pageAccessToken: string;
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
}

// Business Details
export interface IBusinessDetails {
  businessName: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  facebookPage: string;
  whatsappNumber: string;
}

// Subscription
export interface ISubscription {
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  maxRules: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  couponUsed: string;
  paymentMethod: string;
  amount: number;
  transactionId: string;
}

// Message Stats
export interface IMessageStats {
  totalReceived: number;
  totalReplied: number;
  lastMessageAt: Date | null;
}

// Rule Interface
export interface IRule {
  _id: string;
  userId: string;
  keyword: string;
  reply: string;
  platform: 'both' | 'messenger' | 'whatsapp';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Settings Interface
export interface ISettings {
  _id: string;
  userId: string;
  aiContext: string;
  defaultReply: string;
  isAutoReplyEnabled: boolean;
  isAwayMode: boolean;
  awayMessage: string;
  greetingMessage: string;
  isGreetingEnabled: boolean;
}

// Product Interface
export interface IProduct {
  _id: string;
  userId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
}

// Coupon Interface
export interface ICoupon {
  _id: string;
  code: string;
  discount: number;
  plan: 'all' | 'starter' | 'pro' | 'enterprise';
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
}

// API Response
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Webhook Event
export interface IMessengerEvent {
  sender: { id: string };
  recipient: { id: string };
  message?: {
    mid: string;
    text: string;
  };
  timestamp: number;
}

// WhatsApp Message
export interface IWhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video';
  text?: { body: string };
}

// Gemini AI Config
export interface IAIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

// Admin Stats
export interface IAdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRules: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
}
