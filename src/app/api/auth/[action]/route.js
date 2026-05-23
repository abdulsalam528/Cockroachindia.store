import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026';

export async function POST(request, { params }) {
  await dbConnect();
  
  // Resolve params
  const { action } = await params;

  try {
    if (action === 'register') {
      const { email, password, fullName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country } = await request.json();

      if (!email || !password || !fullName || !phoneNumber) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Generate a mock unique CJP Member ID
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const partyMemberId = `CJP-2026-${randomNum}`;

      // Automatically verify member if they register as admin
      const isAdmin = email === 'admin@cjp.org' || email === 'admin@cockroachindia.shop';
      const isVerifiedMember = isAdmin;

      // Handle default address fields
      const addresses = [];
      if (addressLine1 || city || state || postalCode) {
        addresses.push({
          addressLine1: addressLine1 || '123 Slacker Lane',
          addressLine2: addressLine2 || '',
          city: city || 'Delhi',
          state: state || 'Delhi',
          postalCode: postalCode || '110001',
          country: country || 'India',
          isDefault: true
        });
      } else {
        // Fallback default address so every user has one
        addresses.push({
          addressLine1: '123 Slacker Lane',
          addressLine2: '',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India',
          isDefault: true
        });
      }

      const user = await User.create({
        email,
        passwordHash,
        fullName,
        phoneNumber,
        addresses,
        partyMemberId,
        isVerifiedMember
      });

      // Create session token
      const token = jwt.sign(
        { id: user._id, email: user.email, fullName: user.fullName, isAdmin, isVerifiedMember: user.isVerifiedMember },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        message: 'Registration successful',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
          partyMemberId: user.partyMemberId,
          isVerifiedMember: user.isVerifiedMember,
          isAdmin
        }
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    if (action === 'login') {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }

      const isAdmin = user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop';
      const token = jwt.sign(
        { id: user._id, email: user.email, fullName: user.fullName, isAdmin, isVerifiedMember: user.isVerifiedMember },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
          partyMemberId: user.partyMemberId,
          isVerifiedMember: user.isVerifiedMember,
          isAdmin
        }
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ message: 'Logged out successfully' });
      response.cookies.delete('token');
      return response;
    }

    if (action === 'add-address') {
      const token = request.cookies.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
      const decoded = jwt.verify(token, JWT_SECRET);

      const { addressLine1, addressLine2, city, state, postalCode, country, isDefault } = await request.json();
      if (!addressLine1 || !city || !state || !postalCode) {
        return NextResponse.json({ error: 'Address Line 1, City, State, and PIN Code are required.' }, { status: 400 });
      }

      const user = await User.findById(decoded.id);
      if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

      if (isDefault || user.addresses.length === 0) {
        user.addresses.forEach(addr => { addr.isDefault = false; });
      }

      user.addresses.push({
        addressLine1,
        addressLine2: addressLine2 || '',
        city,
        state,
        postalCode,
        country: country || 'India',
        isDefault: isDefault || user.addresses.length === 0
      });

      await user.save();
      
      const isAdmin = user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop';
      return NextResponse.json({ 
        message: 'Address added successfully', 
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
          partyMemberId: user.partyMemberId,
          isVerifiedMember: user.isVerifiedMember,
          isAdmin
        }
      });
    }

    if (action === 'delete-address') {
      const token = request.cookies.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
      const decoded = jwt.verify(token, JWT_SECRET);

      const { addressId } = await request.json();
      if (!addressId) return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });

      const user = await User.findById(decoded.id);
      if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
      if (addressIndex === -1) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

      const wasDefault = user.addresses[addressIndex].isDefault;
      user.addresses.splice(addressIndex, 1);

      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();
      
      const isAdmin = user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop';
      return NextResponse.json({ 
        message: 'Address deleted successfully', 
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
          partyMemberId: user.partyMemberId,
          isVerifiedMember: user.isVerifiedMember,
          isAdmin
        }
      });
    }

    if (action === 'set-default-address') {
      const token = request.cookies.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
      const decoded = jwt.verify(token, JWT_SECRET);

      const { addressId } = await request.json();
      if (!addressId) return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });

      const user = await User.findById(decoded.id);
      if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

      let found = false;
      user.addresses.forEach(addr => {
        if (addr._id.toString() === addressId) {
          addr.isDefault = true;
          found = true;
        } else {
          addr.isDefault = false;
        }
      });

      if (!found) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

      await user.save();
      
      const isAdmin = user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop';
      return NextResponse.json({ 
        message: 'Default address updated successfully', 
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
          partyMemberId: user.partyMemberId,
          isVerifiedMember: user.isVerifiedMember,
          isAdmin
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  await dbConnect();
  
  const { action } = await params;

  if (action === 'me') {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 401 });
      }

      const isAdmin = user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop';
      return NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
          partyMemberId: user.partyMemberId,
          isVerifiedMember: user.isVerifiedMember,
          isAdmin
        }
      });
    } catch (err) {
      console.error('Auth verify me failed:', err.message);
      const response = NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
