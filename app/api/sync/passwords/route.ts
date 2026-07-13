import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { PasswordEntry } from '@/types';
export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ passwords: [] });
  const rows = await prisma.password.findMany({ where: { userId: session.user.id }, orderBy: { siteName: 'asc' } });
  const passwords: PasswordEntry[] = rows.map((p) => ({ id: p.id, siteName: p.siteName, siteUrl: p.siteUrl ?? undefined, username: p.username, password: p.password, notes: p.notes ?? undefined, category: p.category, createdAt: p.createdAt.getTime(), updatedAt: p.updatedAt.getTime() }));
  return NextResponse.json({ passwords });
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { passwords }: { passwords: PasswordEntry[] } = await req.json();
  await prisma.$transaction(async (tx) => {
    await tx.password.deleteMany({ where: { userId: session.user.id } });
    if (passwords.length) await tx.password.createMany({ data: passwords.map((p) => ({ id: p.id, userId: session.user.id, siteName: p.siteName, siteUrl: p.siteUrl ?? null, username: p.username, password: p.password, notes: p.notes ?? null, category: p.category, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })) });
  });
  return NextResponse.json({ ok: true });
}
