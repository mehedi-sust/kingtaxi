import { NextRequest, NextResponse } from 'next/server';

type GeocodeResult = {
  display_name: string;
  lat: string;
  lon: string;
};

async function queryNominatim(query: string): Promise<GeocodeResult[]> {
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=gb&q=${encodeURIComponent(query)}`;
  const response = await fetch(nominatimUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'KingTaxiWebapp/1.0 (contact: info@kingtaxi.co.uk)',
    },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data
    .map((item: any) => ({
      display_name: String(item?.display_name || '').trim(),
      lat: String(item?.lat || ''),
      lon: String(item?.lon || ''),
    }))
    .filter((item: GeocodeResult) => item.display_name && item.lat && item.lon);
}

async function queryPhoton(query: string): Promise<GeocodeResult[]> {
  const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`;
  const response = await fetch(photonUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'KingTaxiWebapp/1.0 (contact: info@kingtaxi.co.uk)',
    },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = await response.json();
  const features = Array.isArray(data?.features) ? data.features : [];
  return features
    .map((feature: any) => {
      const coords = Array.isArray(feature?.geometry?.coordinates) ? feature.geometry.coordinates : [];
      const lon = coords.length > 0 ? String(coords[0]) : '';
      const lat = coords.length > 1 ? String(coords[1]) : '';
      const props = feature?.properties || {};
      const parts = [
        props.name,
        props.street,
        props.city,
        props.state,
        props.postcode,
        props.country,
      ]
        .filter(Boolean)
        .map((value: any) => String(value).trim())
        .filter(Boolean);
      const displayName = parts.join(', ');
      return {
        display_name: displayName,
        lat,
        lon,
        countryCode: String(props.countrycode || '').toLowerCase(),
      };
    })
    .filter((item: any) => item.display_name && item.lat && item.lon)
    .filter((item: any) => !item.countryCode || item.countryCode === 'gb')
    .slice(0, 6)
    .map((item: any) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || '';
  if (query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    let results = await queryNominatim(query);
    if (!results.length) {
      results = await queryPhoton(query);
    }
    const unique = new Map<string, GeocodeResult>();
    for (const item of results) {
      const key = item.display_name.toLowerCase();
      if (!unique.has(key)) unique.set(key, item);
    }
    return NextResponse.json(Array.from(unique.values()).slice(0, 6));
  } catch {
    return NextResponse.json([]);
  }
}
