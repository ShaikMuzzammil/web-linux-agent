import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ nodes: {} });
  const rows = await prisma.file.findMany({ where: { userId: session.user.id } });
  const nodes: Record<string, unknown> = {};
  rows.forEach((f) => { nodes[f.fsId] = { id: f.fsId, name: f.name, type: f.type, parentId: f.parentFsId ?? null, content: f.content ?? undefined, size: f.size ?? undefined, isHidden: f.isHidden, createdAt: f.createdAt.getTime(), modifiedAt: f.updatedAt.getTime() }; });
  return NextResponse.json({ nodes });
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { nodes } = await req.json();
  const entries = Object.values(nodes) as { id: string; name: string; type: string; parentId: string | null; content?: string; size?: number; isHidden?: boolean }[];
  for (const node of entries) {
    await prisma.file.upsert({ where: { userId_fsId: { userId: session.user.id, fsId: node.id } }, update: { name: node.name, type: node.type, parentFsId: node.parentId, content: node.content ?? null, size: node.size ?? null, isHidden: node.isHidden ?? false }, create: { userId: session.user.id, fsId: node.id, name: node.name, type: node.type, parentFsId: node.parentId, content: node.content ?? null, size: node.size ?? null, isHidden: node.isHidden ?? false } });
  }
  return NextResponse.json({ ok: true });
}
