import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get the employee email before deleting
    const employee = await prisma.employee.findUnique({ where: { id } });
    
    await prisma.employee.delete({
      where: { id }
    });

    if (employee) {
      // Also delete from Supabase Auth
      try {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        if (data?.users) {
          const authUser = data.users.find(u => u.email === employee.email);
          if (authUser) {
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
          }
        }
      } catch (authErr) {
        console.error("Failed to delete from Supabase Auth", authErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete employee", error);
    return NextResponse.json({ error: 'Failed to delete employee', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      }
    });
    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    console.error("Failed to update employee", error);
    return NextResponse.json({ error: 'Failed to update employee', details: error.message }, { status: 500 });
  }
}
