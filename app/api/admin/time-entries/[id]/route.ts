import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseClient(cookieStore: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { },
      },
    }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = getSupabaseClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Sjekk om timeføringen eksisterer
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!entry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    // Bare "post@krsvr.no" eller den som eier timen kan slette
    const isManager = user.email === 'post@krsvr.no';
    if (!isManager && entry.employee.email !== user.email) {
      return NextResponse.json({ error: 'You can only delete your own time entries' }, { status: 403 });
    }

    await prisma.timeEntry.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete time entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
