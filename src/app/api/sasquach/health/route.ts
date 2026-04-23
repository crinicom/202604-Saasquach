import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    features: {
      pwa: true,
      offline: true,
      sync: 'backgroundSync' in ServiceWorkerRegistration.prototype ? 'native' : 'fallback'
    }
  });
}