import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { UserPreferences } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ settings: null });

    const s = await prisma.userSettings.findUnique({ where: { userId: session.user.id } });
    if (!s) return NextResponse.json({ settings: null });

    const settings: UserPreferences = {
      themeMode:    s.themeMode as 'dark' | 'light',
      accentColor:  s.accentColor,
      wallpaper:    s.wallpaper,
      dockPinned:   s.dockPinned,
      desktopIcons: (() => { try { return JSON.parse(s.desktopIcons); } catch { return {}; } })(),
      fontSize:     s.fontSize as 'small' | 'medium' | 'large',
      animations:   s.animations,
      notifications: s.notifications,
    };
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[settings GET]', err);
    return NextResponse.json({ settings: null });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { settings }: { settings: Partial<UserPreferences> } = await req.json();

    await prisma.userSettings.upsert({
      where:  { userId: session.user.id },
      update: {
        ...(settings.themeMode    !== undefined && { themeMode:    settings.themeMode }),
        ...(settings.accentColor  !== undefined && { accentColor:  settings.accentColor }),
        ...(settings.wallpaper    !== undefined && { wallpaper:    settings.wallpaper }),
        ...(settings.dockPinned   !== undefined && { dockPinned:   settings.dockPinned }),
        ...(settings.desktopIcons !== undefined && { desktopIcons: JSON.stringify(settings.desktopIcons) }),
        ...(settings.fontSize     !== undefined && { fontSize:     settings.fontSize }),
        ...(settings.animations   !== undefined && { animations:   settings.animations }),
        ...(settings.notifications !== undefined && { notifications: settings.notifications }),
      },
      create: {
        userId:        session.user.id,
        themeMode:     settings.themeMode    ?? 'dark',
        accentColor:   settings.accentColor  ?? '#E95420',
        wallpaper:     settings.wallpaper    ?? '/wallpapers/default.svg',
        dockPinned:    settings.dockPinned   ?? ['filemanager', 'terminal', 'texteditor', 'browser', 'settings'],
        desktopIcons:  JSON.stringify(settings.desktopIcons ?? {}),
        fontSize:      settings.fontSize     ?? 'medium',
        animations:    settings.animations   ?? true,
        notifications: settings.notifications ?? true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[settings POST]', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
