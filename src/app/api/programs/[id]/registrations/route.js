import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET(req, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await the params object in Next.js 15+ compatible dynamic routes
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const registrations = await prisma.programRegistration.findMany({
      where: { programId: id },
      include: {
        member: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return NextResponse.json(registrations);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
