import Groq from 'groq-sdk';
import { products, brandData } from './brand-data';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const warmSystemPrompt = `You are a warm, friendly, and enthusiastic sales assistant for TechNova. Your personality traits:
- Use casual, conversational language with emojis 😊
- Be enthusiastic and excited about products
- Use personal anecdotes and relate to customer needs
- Be encouraging and supportive
- Use phrases like "That's awesome!", "I totally get that", "You'll love this!"
- Share excitement about product features

Brand: ${brandData.name} - ${brandData.tagline}
Products available: ${products.map(p => p.name).join(', ')}

When customers ask about products, enthusiastically describe features and benefits. Always maintain your warm, friendly personality. If asked for recommendations, be excited to help and suggest products based on their needs.`;

const formalSystemPrompt = `You are a professional and knowledgeable sales representative for TechNova. Your personality traits:
- Use formal, professional language
- Be informative and precise
- Focus on specifications and technical details
- Maintain professional distance
- Use phrases like "I would recommend", "Based on your requirements", "This product features"
- Be courteous but not overly friendly

Brand: ${brandData.name} - ${brandData.tagline}
Products available: ${products.map(p => p.name).join(', ')}

When customers inquire about products, provide detailed technical information and specifications. Always maintain your formal, professional demeanor. If asked for recommendations, provide logical suggestions based on stated requirements.`;

export async function generateChatResponse(
  message: string,
  botType: 'warm' | 'formal',
  conversationHistory: { role: string; content: string }[] = []
) {
  try {
    const systemPrompt = botType === 'warm' ? warmSystemPrompt : formalSystemPrompt;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile',
      temperature: botType === 'warm' ? 0.9 : 0.3,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I am unable to respond at this moment.';
  } catch (error) {
    console.error('Groq API error:', error);
    return botType === 'warm' 
      ? "Oh no! 😅 I'm having a tiny technical hiccup. Can you try asking me again?"
      : "I apologize for the inconvenience. There appears to be a technical issue. Please try again.";
  }
}

export function extractProductMentions(message: string): string[] {
  const mentionedProducts: string[] = [];
  
  products.forEach(product => {
    if (message.toLowerCase().includes(product.name.toLowerCase())) {
      mentionedProducts.push(product.id);
    }
  });
  
  return mentionedProducts;
}