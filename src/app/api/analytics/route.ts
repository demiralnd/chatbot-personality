import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/db-vercel';
import { Analytics } from '@/types';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const botType = searchParams.get('botType') as 'warm' | 'formal' | null;

    const data = await getAnalytics(botType || undefined);
    
    // Process analytics data
    const warmAnalytics: Analytics = {
      botType: 'warm',
      totalConversations: 0,
      avgConversationDuration: 0,
      totalConversions: 0,
      conversionRate: 0,
      productEngagement: {},
      avgMessagesPerConversation: 0,
    };

    const formalAnalytics: Analytics = {
      botType: 'formal',
      totalConversations: 0,
      avgConversationDuration: 0,
      totalConversions: 0,
      conversionRate: 0,
      productEngagement: {},
      avgMessagesPerConversation: 0,
    };

    // Group by bot type
    const conversationsByType = {
      warm: data.conversations.filter((c: any) => c.bot_type === 'warm'),
      formal: data.conversations.filter((c: any) => c.bot_type === 'formal'),
    };

    // Calculate metrics for each type
    ['warm', 'formal'].forEach((type) => {
      const analytics = type === 'warm' ? warmAnalytics : formalAnalytics;
      const conversations = conversationsByType[type as keyof typeof conversationsByType];
      
      analytics.totalConversations = conversations.length;
      
      // Calculate average duration
      const durations = conversations
        .filter((c: any) => c.end_time)
        .map((c: any) => new Date(c.end_time).getTime() - new Date(c.start_time).getTime());
      
      analytics.avgConversationDuration = durations.length > 0
        ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length / 1000 / 60 // in minutes
        : 0;

      // Count conversions
      const convIds = conversations.map((c: any) => c.id);
      const typeConversions = data.conversions.filter((conv: any) => 
        convIds.includes(conv.conversation_id)
      );
      
      analytics.totalConversions = new Set(
        typeConversions.map((c: any) => c.conversation_id)
      ).size;
      
      analytics.conversionRate = analytics.totalConversations > 0
        ? (analytics.totalConversions / analytics.totalConversations) * 100
        : 0;

      // Product engagement
      typeConversions.forEach((conv: any) => {
        if (!analytics.productEngagement[conv.product_id]) {
          analytics.productEngagement[conv.product_id] = {
            views: 0,
            inquiries: 0,
            addToCart: 0,
            purchaseIntent: 0,
          };
        }
        
        switch (conv.event_type) {
          case 'view':
            analytics.productEngagement[conv.product_id].views++;
            break;
          case 'inquiry':
            analytics.productEngagement[conv.product_id].inquiries++;
            break;
          case 'add_to_cart':
            analytics.productEngagement[conv.product_id].addToCart++;
            break;
          case 'purchase_intent':
            analytics.productEngagement[conv.product_id].purchaseIntent++;
            break;
        }
      });

      // Average messages per conversation
      const typeMessages = data.messages.filter((m: any) =>
        convIds.includes(m.conversation_id)
      );
      
      analytics.avgMessagesPerConversation = analytics.totalConversations > 0
        ? typeMessages.length / analytics.totalConversations
        : 0;
    });

    return NextResponse.json({
      warm: warmAnalytics,
      formal: formalAnalytics,
      raw: data,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}