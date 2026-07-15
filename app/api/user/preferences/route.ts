import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const prefs = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ prefs });
  } catch (err) {
    console.error("[prefs GET]", err);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const ALLOWED = ["wallpaper", "themeMode", "accentColor", "fontSize", "animations", "notifications"] as const;
    const data = Object.fromEntries(
      Object.entries(body).filter(([k]) => (ALLOWED as readonly string[]).includes(k))
    );
    const prefs = await prisma.userSettings.upsert({
      where:  { userId: session.user.id },
      update: data,
      create: { userId: session.user.id, ...data },
    });
    return NextResponse.json({ prefs });
  } catch (err) {
    console.error("[prefs PATCH]", err);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
