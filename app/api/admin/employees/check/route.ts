import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const employee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    return NextResponse.json({ exists: !!employee });
  } catch (error) {
    console.error("Failed to check employee email", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
