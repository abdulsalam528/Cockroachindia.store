import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  await dbConnect();

  try {
    // Retrieve users, returning only public metadata for the directory
    const members = await User.find({})
      .select('fullName email partyMemberId isVerifiedMember whatsappLink createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Mask emails for basic privacy
    const sanitizedMembers = members.map(m => {
      const emailParts = m.email.split('@');
      const maskedEmail = emailParts[0].substring(0, 3) + '***@' + emailParts[1];
      return {
        ...m,
        email: maskedEmail
      };
    });

    return NextResponse.json({ members: sanitizedMembers });
  } catch (error) {
    console.error('Fetch members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
