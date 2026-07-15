import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name:     name?.trim() || email.split("@")[0],
        email:    email.toLowerCase(),
        password: hashed,
        settings: {
          create: {
            wallpaper:    "/wallpapers/default.svg",
            themeMode:    "dark",
            accentColor:  "#E95420",
            fontSize:     "medium",
            dockPinned:   ["filemanager", "terminal", "texteditor", "browser", "settings"],
            animations:   true,
            notifications: true,
          },
        },
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user, message: "Account created!" }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
