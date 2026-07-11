import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: session.user.id }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 });
    }

    // Verify current password match
    const isValid = await bcrypt.compare(currentPassword, member.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Hash and store the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.member.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
