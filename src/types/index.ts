export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  productMentioned?: string[];
}

export interface Conversation {
  id: string;
  sessionId: string;
  botType: 'warm' | 'formal';
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  productsViewed: string[];
  productsInquired: string[];
  conversionEvents: ConversionEvent[];
}

export interface ConversionEvent {
  id: string;
  conversationId: string;
  productId: string;
  eventType: 'view' | 'inquiry' | 'add_to_cart' | 'purchase_intent';
  timestamp: Date;
  value?: number;
}

export interface Analytics {
  botType: 'warm' | 'formal';
  totalConversations: number;
  avgConversationDuration: number;
  totalConversions: number;
  conversionRate: number;
  productEngagement: {
    [productId: string]: {
      views: number;
      inquiries: number;
      addToCart: number;
      purchaseIntent: number;
    };
  };
  avgMessagesPerConversation: number;
  userSatisfactionScore?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'researcher';
  createdAt: Date;
}