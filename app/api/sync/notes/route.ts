import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { Note } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ notes: [] });
  const dbNotes = await prisma.note.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: 'desc' } });
  const notes: Note[] = dbNotes.map((n) => ({ id: n.id, title: n.title, content: n.content, color: n.color, folderId: n.folderId ?? undefined, isPinned: n.isPinned, createdAt: n.createdAt.getTime(), updatedAt: n.updatedAt.getTime() }));
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { notes }: { notes: Note[] } = await req.json();
  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({ where: { userId: session.user.id } });
    if (notes.length > 0) {
      await tx.note.createMany({ data: notes.map((n) => ({ id: n.id, userId: session.user.id, title: n.title, content: n.content, color: n.color, folderId: n.folderId ?? null, isPinned: n.isPinned, createdAt: new Date(n.createdAt), updatedAt: new Date(n.updatedAt) })) });
    }
  });
  return NextResponse.json({ ok: true });
}
