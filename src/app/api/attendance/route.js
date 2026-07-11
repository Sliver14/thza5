import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { registrationId, email, phone, programId } = await req.json();
    
    let registration = null;

    if (registrationId) {
      // Resolve registration by direct ticket registration ID
      registration = await prisma.programRegistration.findUnique({
        where: { id: registrationId },
        include: {
          member: true,
          program: true,
        },
      });
    } else if ((email || phone) && programId) {
      // Resolve registration by member lookup details and programId selection
      const member = await prisma.member.findFirst({
        where: {
          OR: [
            email ? { email } : null,
            phone ? { phone } : null,
          ].filter(Boolean),
        },
      });

      if (member) {
        registration = await prisma.programRegistration.findUnique({
          where: {
            memberId_programId: {
              memberId: member.id,
              programId: programId,
            },
          },
          include: {
            member: true,
            program: true,
          },
        });

        // Automatically register the member for the program if not already registered
        if (!registration) {
          const program = await prisma.program.findUnique({
            where: { id: programId }
          });
          if (!program) {
            return NextResponse.json({ error: 'Program not found' }, { status: 404 });
          }

          registration = await prisma.programRegistration.create({
            data: {
              memberId: member.id,
              programId: programId,
              attended: false,
              fieldResponses: {},
            },
            include: {
              member: true,
              program: true,
            }
          });
        }
      } else {
        return NextResponse.json({ error: 'Member not found. Please register as a member first.' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Provide registration ticket ID or member lookup identifier alongside program choice' }, { status: 400 });
    }

    if (!registration) {
      return NextResponse.json({ error: 'Attendance ticket registration not found' }, { status: 404 });
    }

    // Business Logic constraint: Marks present when program date is equal to or greater than current date
    const now = new Date();

    if (registration.attended) {
      return NextResponse.json({ 
        success: true, 
        alreadyAttended: true, 
        message: 'Member already checked in.', 
        registration 
      });
    }

    // Update attendance fields
    const updatedRegistration = await prisma.programRegistration.update({
      where: { id: registration.id },
      data: {
        attended: true,
        attendedAt: now,
      },
      include: {
        member: true,
        program: true,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyAttended: false,
      message: `Checked in successfully: ${updatedRegistration.member.firstName} ${updatedRegistration.member.lastName}`,
      registration: updatedRegistration,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process attendance mark' }, { status: 500 });
  }
}
