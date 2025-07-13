import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        bot_type TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        products_mentioned TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conversion_events (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        value REAL
      );
    `;

    // Create admin user if not exists
    const adminExists = await sql`SELECT id FROM users WHERE username = 'admin'`;
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await sql`
        INSERT INTO users (id, username, email, password_hash, role) 
        VALUES (${generateId()}, 'admin', 'admin@technova.com', ${hashedPassword}, 'admin')
      `;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Conversation functions
export async function createConversation(sessionId: string, botType: 'warm' | 'formal') {
  const id = generateId();
  await sql`
    INSERT INTO conversations (id, session_id, bot_type, start_time) 
    VALUES (${id}, ${sessionId}, ${botType}, ${new Date().toISOString()})
  `;
  return id;
}

export async function endConversation(conversationId: string) {
  await sql`
    UPDATE conversations SET end_time = ${new Date().toISOString()} 
    WHERE id = ${conversationId}
  `;
}

// Message functions
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  productsMentioned?: string[]
) {
  const id = generateId();
  await sql`
    INSERT INTO messages (id, conversation_id, role, content, timestamp, products_mentioned) 
    VALUES (${id}, ${conversationId}, ${role}, ${content}, ${new Date().toISOString()}, ${JSON.stringify(productsMentioned || [])})
  `;
  return id;
}

// Conversion tracking
export async function trackConversion(
  conversationId: string,
  productId: string,
  eventType: 'view' | 'inquiry' | 'add_to_cart' | 'purchase_intent',
  value?: number
) {
  const id = generateId();
  await sql`
    INSERT INTO conversion_events (id, conversation_id, product_id, event_type, timestamp, value) 
    VALUES (${id}, ${conversationId}, ${productId}, ${eventType}, ${new Date().toISOString()}, ${value || null})
  `;
  return id;
}

// Analytics functions
export async function getAnalytics(botType?: 'warm' | 'formal') {
  let conversations;
  if (botType) {
    conversations = await sql`SELECT * FROM conversations WHERE bot_type = ${botType}`;
  } else {
    conversations = await sql`SELECT * FROM conversations`;
  }
  
  const conversationIds = conversations.rows.map((c: any) => c.id);
  
  let messages, conversions;
  if (conversationIds.length > 0) {
    // Use ANY to check if conversation_id is in array
    messages = await sql`SELECT * FROM messages WHERE conversation_id = ANY(${conversationIds})`;
    conversions = await sql`SELECT * FROM conversion_events WHERE conversation_id = ANY(${conversationIds})`;
  } else {
    messages = { rows: [] };
    conversions = { rows: [] };
  }
  
  return {
    conversations: conversations.rows,
    messages: messages.rows,
    conversions: conversions.rows
  };
}

// Auth functions
export async function validateUser(username: string, password: string) {
  const result = await sql`SELECT * FROM users WHERE username = ${username}`;
  const user = result.rows[0];
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };
}