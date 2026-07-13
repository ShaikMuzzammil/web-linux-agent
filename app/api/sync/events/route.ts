import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { CalendarEvent } from '@/types';
export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ events: [] });
  const rows = await prisma.calendarEvent.findMany({ where: { userId: session.user.id } });
  const events: CalendarEvent[] = rows.map((e) => ({ id: e.id, title: e.title, description: e.description ?? undefined, startDate: e.startDate.toISOString(), endDate: e.endDate.toISOString(), allDay: e.allDay, color: e.color, location: e.location ?? undefined, recurring: e.recurring ?? undefined, createdAt: e.createdAt.getTime(), updatedAt: e.updatedAt.getTime() }));
  return NextResponse.json({ events });
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { events }: { events: CalendarEvent[] } = await req.json();
  await prisma.$transaction(async (tx) => {
    await tx.calendarEvent.deleteMany({ where: { userId: session.user.id } });
    if (events.length) await tx.calendarEvent.createMany({ data: events.map((e) => ({ id: e.id, userId: session.user.id, title: e.title, description: e.description ?? null, startDate: new Date(e.startDate), endDate: new Date(e.endDate), allDay: e.allDay, color: e.color, location: e.location ?? null, recurring: e.recurring ?? null, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt) })) });
  });
  return NextResponse.json({ ok: true });
}
