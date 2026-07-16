import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'  },
        password: { label: 'Password', type: 'password' },
        name:     { label: 'Name',     type: 'text'   },
        action:   { label: 'Action',   type: 'text'   }, // 'login' | 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // ── Register ─────────────────────────────────────────
        if (credentials.action === 'register') {
          const exists = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          if (exists) throw new Error('Email already registered');

          const hashed = await bcrypt.hash(credentials.password, 12);
          const user = await prisma.user.create({
            data: {
              email:    credentials.email.toLowerCase(),
              name:     credentials.name || credentials.email.split('@')[0],
              password: hashed,
            },
          });

          // Create default settings for the new user
          await prisma.userSettings.create({
            data: {
              userId:        user.id,
              themeMode:     'dark',
              accentColor:   '#E95420',
              wallpaper:     '/wallpapers/default.svg',
              fontSize:      'medium',
              dockPinned:    ['filemanager', 'terminal', 'texteditor', 'browser', 'settings'],
              animations:    true,
              notifications: true,
            },
          });

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        // ── Login ─────────────────────────────────────────────
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.password) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id;
        token.name    = user.name;
        token.email   = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id    = token.id as string;
        session.user.name  = token.name;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
};
