import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(request: NextRequest) {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit') ?? '5';
  const status = searchParams.get('status');

  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);

  try {
    const res = await fetch(`${API_URL}/bookings?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 });
  }
}
