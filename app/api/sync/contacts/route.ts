import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { Contact } from '@/types';
export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ contacts: [] });
  const rows = await prisma.contact.findMany({ where: { userId: session.user.id }, orderBy: { name: 'asc' } });
  const contacts: Contact[] = rows.map((c) => ({ id: c.id, name: c.name, email: c.email ?? undefined, phone: c.phone ?? undefined, address: c.address ?? undefined, company: c.company ?? undefined, website: c.website ?? undefined, avatar: c.avatar ?? undefined, notes: c.notes ?? undefined, tags: c.tags, createdAt: c.createdAt.getTime(), updatedAt: c.updatedAt.getTime() }));
  return NextResponse.json({ contacts });
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { contacts }: { contacts: Contact[] } = await req.json();
  await prisma.$transaction(async (tx) => {
    await tx.contact.deleteMany({ where: { userId: session.user.id } });
    if (contacts.length) await tx.contact.createMany({ data: contacts.map((c) => ({ id: c.id, userId: session.user.id, name: c.name, email: c.email ?? null, phone: c.phone ?? null, address: c.address ?? null, company: c.company ?? null, website: c.website ?? null, avatar: c.avatar ?? null, notes: c.notes ?? null, tags: c.tags, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })) });
  });
  return NextResponse.json({ ok: true });
}
