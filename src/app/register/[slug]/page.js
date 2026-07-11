import prisma from '@/lib/db';
import RegistrationFlow from '@/components/RegistrationFlow';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Fetch fresh data on every request

export default async function RegisterPage({ params }) {
  // Await params object for dynamic routing compatibility
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const program = await prisma.program.findUnique({
    where: { slug },
  });

  if (!program) {
    return notFound();
  }

  return <RegistrationFlow program={program} />;
}
