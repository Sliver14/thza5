import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import qr from 'qrcode';

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      programId,
      memberId,
      // If registering a new member alongside the program
      isNewMember,
      firstName,
      lastName,
      email,
      phone,
      kcUsername,
      chapter,
      careGroup,
      role,
      occupation,
      // Custom program fields
      fieldResponses,
    } = data;

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    let finalMemberId = memberId;

    // Handle new member creation first if they aren't on the database
    if (isNewMember) {
      const { password } = data;
      if (!firstName || !lastName || !email || !phone || !kcUsername || !chapter || !careGroup || !role || !occupation || !password) {
        return NextResponse.json({ error: 'All core member fields and password are required' }, { status: 400 });
      }

      // Check if email or phone is already taken to prevent constraints crash
      const existing = await prisma.member.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      });

      if (existing) {
        finalMemberId = existing.id;
      } else {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const newMember = await prisma.member.create({
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
        finalMemberId = newMember.id;
      }
    }

    if (!finalMemberId) {
      return NextResponse.json({ error: 'Member profile could not be resolved' }, { status: 400 });
    }

    // Check if member is already registered for this specific program
    const existingRegistration = await prisma.programRegistration.findUnique({
      where: {
        memberId_programId: {
          memberId: finalMemberId,
          programId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'You are already registered for this program' }, { status: 400 });
    }

    // Create the program registration first to obtain its unique ID
    let registration = await prisma.programRegistration.create({
      data: {
        memberId: finalMemberId,
        programId,
        fieldResponses: fieldResponses || {},
      },
      include: {
        member: true,
        program: true,
      },
    });

    // Generate dynamic Check-in QR ticket containing the registration entry ID
    const ticketQrUrl = await qr.toDataURL(registration.id, {
      color: {
        dark: '#1c0b29', // Deep dark theme contrast
        light: '#ffffff'
      },
      width: 400,
      margin: 2
    });

    // Save generated ticket QR code back to the registration record
    registration = await prisma.programRegistration.update({
      where: { id: registration.id },
      data: { ticketQrUrl },
      include: {
        member: true,
        program: true
      }
    });

    return NextResponse.json({ success: true, registration });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
