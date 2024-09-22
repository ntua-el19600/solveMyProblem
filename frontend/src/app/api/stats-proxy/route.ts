import { NextResponse, NextRequest } from 'next/server';

const PROBLEM_HANDLER_API_URL = process.env.PROBLEM_HANDLER_API_URL;

export async function POST(request: NextRequest) {
  const apiKey = process.env.PROBLEM_HANDLER_API_KEY || '';
  const url = `${PROBLEM_HANDLER_API_URL}/api/probhandler/statistics`;

  const body = await request.json();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Error fetching data:', response.statusText);
      return NextResponse.json({ error: 'Failed to fetch problem data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
