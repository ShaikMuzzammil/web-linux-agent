import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { UserPreferences } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ settings: null });
  const s = await prisma.userSettings.findUnique({ where: { userId: session.user.id } });
  if (!s) return NextResponse.json({ settings: null });
  const settings: UserPreferences = {
    themeMode: s.themeMode as 'dark' | 'light',
    accentColor: s.accentColor,
    wallpaper: s.wallpaper,
    dockPinned: s.dockPinned,
    desktopIcons: JSON.parse(s.desktopIcons),
    fontSize: s.fontSize as 'small' | 'medium' | 'large',
    animations: s.animations,
    notifications: s.notifications,
  };
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { settings }: { settings: Partial<UserPreferences> } = await req.json();
  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      themeMode: settings.themeMode,
      accentColor: settings.accentColor,
      wallpaper: settings.wallpaper,
      dockPinned: settings.dockPinned,
      desktopIcons: JSON.stringify(settings.desktopIcons || {}),
      fontSize: settings.fontSize,
      animations: settings.animations,
      notifications: settings.notifications,
    },
    create: {
      userId: session.user.id,
      themeMode: settings.themeMode || 'dark',
      accentColor: settings.accentColor || '#7C4DFF',
      wallpaper: settings.wallpaper || '/wallpapers/default.jpg',
      dockPinned: settings.dockPinned || [],
      desktopIcons: JSON.stringify(settings.desktopIcons || {}),
    },
  });
  return NextResponse.json({ ok: true });
}
