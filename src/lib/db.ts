import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

let db: any = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'chatbot-study.db'),
      driver: sqlite3.Database
    });
    
    await initializeDatabase();
  }
  return db;
}

async function initializeDatabase() {
  const db = await getDb();
  
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      bot_type TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      products_mentioned TEXT,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS conversion_events (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      value REAL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS analytics_snapshots (
      id TEXT PRIMARY KEY,
      bot_type TEXT NOT NULL,
      date DATE NOT NULL,
      total_conversations INTEGER,
      total_conversions INTEGER,
      avg_conversation_duration REAL,
      avg_messages_per_conversation REAL,
      product_engagement TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create admin user if not exists
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [generateId(), 'admin', 'admin@technova.com', hashedPassword, 'admin']
    );
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Conversation functions
export async function createConversation(sessionId: string, botType: 'warm' | 'formal') {
  const db = await getDb();
  const id = generateId();
  await db.run(
    'INSERT INTO conversations (id, session_id, bot_type, start_time) VALUES (?, ?, ?, ?)',
    [id, sessionId, botType, new Date().toISOString()]
  );
  return id;
}

export async function endConversation(conversationId: string) {
  const db = await getDb();
  await db.run(
    'UPDATE conversations SET end_time = ? WHERE id = ?',
    [new Date().toISOString(), conversationId]
  );
}

// Message functions
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  productsMentioned?: string[]
) {
  const db = await getDb();
  const id = generateId();
  await db.run(
    'INSERT INTO messages (id, conversation_id, role, content, timestamp, products_mentioned) VALUES (?, ?, ?, ?, ?, ?)',
    [id, conversationId, role, content, new Date().toISOString(), JSON.stringify(productsMentioned || [])]
  );
  return id;
}

// Conversion tracking
export async function trackConversion(
  conversationId: string,
  productId: string,
  eventType: 'view' | 'inquiry' | 'add_to_cart' | 'purchase_intent',
  value?: number
) {
  const db = await getDb();
  const id = generateId();
  await db.run(
    'INSERT INTO conversion_events (id, conversation_id, product_id, event_type, timestamp, value) VALUES (?, ?, ?, ?, ?, ?)',
    [id, conversationId, productId, eventType, new Date().toISOString(), value]
  );
  return id;
}

// Analytics functions
export async function getAnalytics(botType?: 'warm' | 'formal') {
  const db = await getDb();
  
  const whereClause = botType ? 'WHERE bot_type = ?' : '';
  const params = botType ? [botType] : [];
  
  const conversations = await db.all(
    `SELECT * FROM conversations ${whereClause}`,
    params
  );
  
  const conversationIds = conversations.map((c: any) => c.id);
  
  const messages = await db.all(
    `SELECT * FROM messages WHERE conversation_id IN (${conversationIds.map(() => '?').join(',')})`,
    conversationIds
  );
  
  const conversions = await db.all(
    `SELECT * FROM conversion_events WHERE conversation_id IN (${conversationIds.map(() => '?').join(',')})`,
    conversationIds
  );
  
  return {
    conversations,
    messages,
    conversions
  };
}

// Auth functions
export async function validateUser(username: string, password: string) {
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  
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