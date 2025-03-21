import { NextResponse } from "next/server";

export const runtime = 'edge';

const fetchChatCompletion = async (sample: string) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "google/gemini-2.0-flash-thinking-exp:free",
      "messages": [
        {
          "role": "system",
          "content": "You are a helpful assistant that specializes with the user management and integrates AWS tools to help with tasks."
        },
        {
          "role": "user",
          "content": sample
        } 
      ]
    })
  });
  return response.json();
};

export async function POST(request: Request) {
  try {
    const { sample } = await request.json();
    
    if (!sample) {
      return NextResponse.json({ error: 'Sample text is required' }, { status: 400 });
    }

    const completion = await fetchChatCompletion(sample);
    
    return NextResponse.json(completion, { status: 200 });

  } catch (error: unknown) {
    console.error('AI API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}