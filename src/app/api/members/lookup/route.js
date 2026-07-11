import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Please enter your email or phone number' }, { status: 400 });
    }

    const trimmed = identifier.trim();

    // Lookup member by email OR phone matching the input identifier
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { email: trimmed },
          { phone: trimmed },
        ],
      },
    });

    if (member) {
      return NextResponse.json({ found: true, member });
    }

    return NextResponse.json({ found: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
