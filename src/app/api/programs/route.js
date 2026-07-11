import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import qr from 'qrcode';

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, description, slug, startDate, endDate, venue, flyerUrl, customFields } = data;

    if (!title || !slug || !startDate || !endDate || !venue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug is already taken
    const existing = await prisma.program.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Program URL slug is already taken' }, { status: 400 });
    }

    // Generate dynamic registration link
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const registerUrl = `${protocol}://${host}/register/${slug}`;

    // Auto-generate QR code base64 image data URL pointing to the registration page
    const qrCodeUrl = await qr.toDataURL(registerUrl, {
      color: {
        dark: '#c8007c', // Primary theme color
        light: '#ffffff'
      },
      width: 400,
      margin: 2
    });

    const program = await prisma.program.create({
      data: {
        title,
        description: description || '',
        slug,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        venue,
        flyerUrl: flyerUrl || '',
        qrCodeUrl,
        customFields: JSON.stringify(customFields || []),
        status: 'UPCOMING',
      },
    });

    return NextResponse.json({ success: true, program });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}

export async function GET(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    return NextResponse.json(programs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}
