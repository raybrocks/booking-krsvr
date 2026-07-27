import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
             // Readonly access
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { email: user.email }
    });

    if (!employee || !employee.isActive) {
      // In case they are not in the DB, they are not authorized as admin/staff
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ user: employee });
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
