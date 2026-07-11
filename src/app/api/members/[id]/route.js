import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await the params object in Next.js 15+ compatible dynamic routes
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, kcUsername, chapter, careGroup, role, occupation } = data;

    const member = await prisma.member.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        kcUsername,
        chapter,
        careGroup,
        role,
        occupation
      }
    });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update member profile' }, { status: 500 });
  }
}
