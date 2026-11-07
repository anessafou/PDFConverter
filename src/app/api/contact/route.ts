// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { hashClientIp, sanitizeText } from '@/core/reviews/spam-protection';
import { reviewsRepository } from '@/core/reviews/reviews-repository';

const DATA_DIR = path.join(process.cwd(), '.data');
const MESSAGES_FILE = path.join(DATA_DIR, 'contact-messages.json');

function saveMessageToFile(record: Record<string, unknown>) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  let existing: unknown[] = [];
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      existing = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
    }
  } catch {
    existing = [];
  }
  existing.unshift(record);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(existing, null, 2), 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const ipHash = hashClientIp(ip);

    // Rate limit: 5 contact submissions per hour
    const isAllowed = await reviewsRepository.checkRateLimit(`ratelimit:contact:${ipHash}`, 5, 3600);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many messages sent recently. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot bot protection
    if (body.honeypot && body.honeypot.trim().length > 0) {
      return NextResponse.json({ error: 'Validation failed.' }, { status: 400 });
    }

    const cleanName = sanitizeText(body.name || '');
    const cleanEmail = sanitizeText(body.email || '');
    const cleanMessage = sanitizeText(body.message || '');

    if (cleanName.length < 2 || cleanName.length > 80) {
      return NextResponse.json({ error: 'Please enter a valid name (2-80 characters).' }, { status: 400 });
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
      return NextResponse.json({ error: 'Message must be between 10 and 2000 characters.' }, { status: 400 });
    }

    const record = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      ipHash,
      createdAt: new Date().toISOString(),
    };

    saveMessageToFile(record);

    return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Failed to process contact message.' }, { status: 500 });
  }
}