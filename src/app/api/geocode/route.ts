import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || '';
  if (query.length < 3) {
    return NextResponse.json([]);
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=gb&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'KingTaxiWebapp/1.0 (contact: info@kingtaxi.co.uk)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}
