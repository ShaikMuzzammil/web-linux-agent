import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' }, // 'login' | 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Register
        if (credentials.action === 'register') {
          const exists = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (exists) throw new Error('Email already registered');

          const hashed = await bcrypt.hash(credentials.password, 12);
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              password: hashed,
            },
          });

          // Create default settings for new user
          await prisma.userSettings.create({
            data: {
              userId: user.id,
              dockPinned: ['filemanager', 'terminal', 'texteditor', 'browser', 'settings'],
            },
          });

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        // Login
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),

    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Create default settings for OAuth users
      if (account?.type === 'oauth' && user.id) {
        const existing = await prisma.userSettings.findUnique({
          where: { userId: user.id },
        });
        if (!existing) {
          await prisma.userSettings.create({
            data: {
              userId: user.id,
              dockPinned: ['filemanager', 'terminal', 'texteditor', 'browser', 'settings'],
            },
          });
        }
      }
      return true;
    },
  },
};
