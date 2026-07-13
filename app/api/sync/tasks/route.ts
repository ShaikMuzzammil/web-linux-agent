import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { Task } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ tasks: [] });
  const dbTasks = await prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } });
  const tasks: Task[] = dbTasks.map((t) => ({ id: t.id, title: t.title, description: t.description ?? undefined, completed: t.completed, priority: t.priority as Task['priority'], dueDate: t.dueDate?.toISOString() ?? undefined, listId: t.listId ?? undefined, tags: t.tags, createdAt: t.createdAt.getTime(), updatedAt: t.updatedAt.getTime() }));
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { tasks }: { tasks: Task[] } = await req.json();
  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { userId: session.user.id } });
    if (tasks.length > 0) {
      await tx.task.createMany({ data: tasks.map((t) => ({ id: t.id, userId: session.user.id, title: t.title, description: t.description ?? null, completed: t.completed, priority: t.priority, dueDate: t.dueDate ? new Date(t.dueDate) : null, listId: t.listId ?? null, tags: t.tags, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) })) });
    }
  });
  return NextResponse.json({ ok: true });
}
