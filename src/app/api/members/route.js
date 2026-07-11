import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        registrations: {
          include: {
            program: true
          }
        }
      }
    });

    return NextResponse.json(members);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
