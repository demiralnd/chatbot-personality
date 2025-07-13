'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { generateId } from '@/lib/db-vercel';

export default function FormalChatPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  useEffect(() => {
    setSessionId(generateId());
  }, []);

  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          botType: 'formal',
          conversationId,
          sessionId,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      ]);

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleConversionEvent = async (productId: string, eventType: string) => {
    if (!conversationId) return;

    try {
      await fetch('/api/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          productId,
          eventType,
        }),
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  return (
    <ChatInterface
      botType="formal"
      onSendMessage={handleSendMessage}
      onConversionEvent={handleConversionEvent}
    />
  );
}