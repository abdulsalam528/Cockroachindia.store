import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026';

async function verifyAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email === 'admin@cjp.org' || decoded.email === 'admin@cockroachindia.shop') return decoded;
    const user = await User.findById(decoded.id);
    if (user && (user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop')) return decoded;
    return false;
  } catch (err) {
    return false;
  }
}

export async function GET(request) {
  await dbConnect();
  
  // Removed verifyAdmin for GET because normal users need settings for dynamic courier tracking links

  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = await Settings.create({ id: 'global', logisticsPartners: [] });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();
  
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { logisticsPartners } = await request.json();
    
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = await Settings.create({ id: 'global', logisticsPartners: [] });
    }
    
    if (logisticsPartners) {
      settings.logisticsPartners = logisticsPartners;
    }
    
    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
