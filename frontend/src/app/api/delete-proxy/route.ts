import { NextRequest, NextResponse } from 'next/server';

const PROBLEM_HANDLER_API_URL = process.env.PROBLEM_HANDLER_API_URL;

export async function POST(request: NextRequest) {
    const apiKey = process.env.PROBLEM_HANDLER_API_KEY || '';
    const { _id: id, userId } = await request.json();

    if (!id || !userId) {
        return NextResponse.json(
            { error: 'Id and userId are required' },
            { status: 400 }
        );
    }

    const deleteUrl = `${PROBLEM_HANDLER_API_URL}/api/probhandler/delete`;

    try {
        const response = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, userId }),
        });

        if (!response.ok) {
            console.error(response.statusText || 'Error deleting problem');
            return NextResponse.json(
                { error: 'Failed to delete the problem' },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { message: 'Problem deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in POST route:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
