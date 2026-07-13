import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { Reminder } from '@/types';
export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ reminders: [] });
  const rows = await prisma.reminder.findMany({ where: { userId: session.user.id }, orderBy: { remindAt: 'asc' } });
  const reminders: Reminder[] = rows.map((r) => ({ id: r.id, title: r.title, description: r.description ?? undefined, remindAt: r.remindAt.toISOString(), isComplete: r.isComplete, priority: r.priority as Reminder['priority'], createdAt: r.createdAt.getTime(), updatedAt: r.updatedAt.getTime() }));
  return NextResponse.json({ reminders });
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { reminders }: { reminders: Reminder[] } = await req.json();
  await prisma.$transaction(async (tx) => {
    await tx.reminder.deleteMany({ where: { userId: session.user.id } });
    if (reminders.length) await tx.reminder.createMany({ data: reminders.map((r) => ({ id: r.id, userId: session.user.id, title: r.title, description: r.description ?? null, remindAt: new Date(r.remindAt), isComplete: r.isComplete, priority: r.priority, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })) });
  });
  return NextResponse.json({ ok: true });
}
