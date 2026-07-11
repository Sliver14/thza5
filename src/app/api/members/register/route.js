import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      kcUsername,
      chapter,
      careGroup,
      role,
      occupation,
    } = data;

    if (!firstName || !lastName || !email || !phone || !password || !kcUsername || !chapter || !careGroup || !role || !occupation) {
      return NextResponse.json({ error: 'All registration parameters are required.' }, { status: 400 });
    }

    // Check if email or phone is already taken
    const existing = await prisma.member.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A member with this email or phone number already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        kcUsername,
        chapter,
        careGroup,
        role,
        occupation,
      },
    });

    return NextResponse.json({ success: true, memberId: member.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create member account.' }, { status: 500 });
  }
}
