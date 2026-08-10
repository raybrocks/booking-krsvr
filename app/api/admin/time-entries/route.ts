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

function calculateHours(startTime: string, endTime: string, dateStr: string) {
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);

  const startDecimal = sH + sM / 60;
  let endDecimal = eH + eM / 60;

  // Håndter vakter som går over midnatt
  if (endDecimal < startDecimal) {
    endDecimal += 24; 
  }

  const totalHours = endDecimal - startDecimal;
  
  const isSunday = new Date(dateStr).getDay() === 0;
  let eveningHours = 0;
  
  if (isSunday) {
    // Alt er kveldstillegg på søndager
    eveningHours = totalHours;
  } else {
    // Hverdager: tillegg etter kl 18:00
    const eveningStart = 18;
    const overlapStart = Math.max(startDecimal, eveningStart);
    const overlapEnd = endDecimal;
    
    if (overlapEnd > overlapStart) {
      eveningHours = overlapEnd - overlapStart;
    }
  }

  return { 
    totalHours: Number(totalHours.toFixed(2)), 
    eveningHours: Number(eveningHours.toFixed(2)) 
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = getSupabaseClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isManager = user.email === 'post@krsvr.no';

    let entries;
    if (isManager) {
      entries = await prisma.timeEntry.findMany({
        include: { employee: true },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }]
      });
    } else {
      // Find employee record
      const employee = await prisma.employee.findUnique({
        where: { email: user.email! }
      });
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      entries = await prisma.timeEntry.findMany({
        where: { employeeId: employee.id },
        include: { employee: true },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }]
      });
    }

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Failed to fetch time entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = getSupabaseClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { date, startTime, endTime, note } = data;

    // Verify employee
    const employee = await prisma.employee.findUnique({
      where: { email: user.email! }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Only registered employees can log hours.' }, { status: 403 });
    }

    const { totalHours, eveningHours } = calculateHours(startTime, endTime, date);

    const timeEntry = await prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        date,
        startTime,
        endTime,
        hours: totalHours,
        eveningHours: eveningHours,
        note: note || ""
      }
    });

    return NextResponse.json(timeEntry);
  } catch (error: any) {
    console.error('Failed to create time entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
