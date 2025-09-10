import { extractErrorMessage } from '@lactalink/utilities';
import status from 'http-status';
import { NextRequest, NextResponse } from 'next/server';

const vercelBypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: status.BAD_REQUEST });
  }

  const headers = new Headers(req.headers);

  if (vercelBypassToken) {
    headers.set('x-vercel-protection-bypass', vercelBypassToken);
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching image', details: extractErrorMessage(error) },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
