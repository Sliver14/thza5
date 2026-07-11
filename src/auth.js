import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const { default: prisma } = await import('@/lib/db');
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isValid) return null;

        return {
          id: admin.id,
          name: admin.username,
          role: 'ADMIN',
        };
      },
    }),
    CredentialsProvider({
      id: 'member-credentials',
      name: 'Member Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { default: prisma } = await import('@/lib/db');
        const member = await prisma.member.findUnique({
          where: { email: credentials.email },
        });

        if (!member) return null;

        const isValid = await bcrypt.compare(credentials.password, member.password);
        if (!isValid) return null;

        return {
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          role: 'MEMBER',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // Fallback login path
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'supersecretkeyforhza5registrationdevelopment',
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(authOptions);
