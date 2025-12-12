import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 *
 * Used by Docker health checks and container orchestration platforms
 * to verify the application is running correctly.
 *
 * @returns JSON response with status and timestamp
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'lactalink-web',
    },
    { status: 200 }
  );
}
