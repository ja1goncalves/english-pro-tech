import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new NextResponse('Text is required', { status: 400 });
        }

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: process.env.OPEN_AI_VOICE || "alloy", // echo, fable, onyx, nova, shimmer
            input: text,
            response_format: "mp3",
        });

        const audioStream = mp3.body;

        return new Response(audioStream, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        });

    } catch (error) {
        console.error('Error in TTS route:', error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return new NextResponse(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}