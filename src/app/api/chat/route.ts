import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, extractProductMentions } from '@/lib/groq-client';
import { createConversation, saveMessage, trackConversion } from '@/lib/db-vercel';

export async function POST(request: NextRequest) {
  try {
    const { message, botType, conversationId, sessionId, conversationHistory } = await request.json();

    // Create conversation if not exists
    let convId = conversationId;
    if (!convId && sessionId) {
      convId = await createConversation(sessionId, botType);
    }

    // Save user message
    if (convId) {
      await saveMessage(convId, 'user', message);
    }

    // Generate response
    const response = await generateChatResponse(message, botType, conversationHistory);

    // Save assistant message
    if (convId) {
      const productsMentioned = extractProductMentions(response);
      await saveMessage(convId, 'assistant', response, productsMentioned);

      // Track product mentions as views
      for (const productId of productsMentioned) {
        await trackConversion(convId, productId, 'view');
      }
    }

    return NextResponse.json({ 
      response, 
      conversationId: convId,
      productsMentioned: extractProductMentions(response)
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}