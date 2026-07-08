import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // REQUIRED on Vercel/production — prevents UntrustedHost error in NextAuth v5
  // Without this, NextAuth cannot determine the host and crashes with a
  // startsWith() error on the request URL object
  trustHost: true,

  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId:     process.env.GITHUB_CLIENT_ID     ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });
          if (!user || !user.password) return null;
          const ok = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        } catch {
          return null;
        }
      },
    }),
  ],

  session:  { strategy: "jwt" },
  pages:    { signIn: "/", error: "/" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});

export const { GET, POST } = handlers;
