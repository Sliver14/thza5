import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await prisma.member.findUnique({
      where: { id: session.user.id },
      include: {
        registrations: {
          include: {
            program: true,
          },
          orderBy: { registeredAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
