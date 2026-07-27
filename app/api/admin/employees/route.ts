import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to fetch employees", error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.email || !data.name) {
       return NextResponse.json({ error: 'Missing email or name' }, { status: 400 });
    }
    const existing = await prisma.employee.findUnique({ where: { email: data.email } });
    if (existing) {
       return NextResponse.json({ error: 'Employee with this email already exists.' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role || 'admin',
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error("Failed to create employee", error);
    return NextResponse.json({ error: 'Failed to create employee', details: error.message }, { status: 500 });
  }
}
