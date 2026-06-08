import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    keyStart: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.substring(0, 50) || 'none'
  });
}
