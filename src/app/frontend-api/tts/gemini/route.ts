import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const ttsClient = new TextToSpeechClient();

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new NextResponse('Text is required', { status: 400 });
        }

        const request = {
            input: { text: text },
            // Select a high-quality, fluid voice.
            // You can find more voices here: https://cloud.google.com/text-to-speech/docs/voices
            voice: {
                languageCode: process.env.TTS_LANGUAGE || 'en-US',
                // This is a high-quality AI "Studio" voice.
                name: 'en-US-Studio-O',
            },
            audioConfig: {
                audioEncoding: 'MP3' as const,
            },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        const audioContent = response.audioContent;

        if (!audioContent) {
            return new NextResponse('Failed to generate audio', { status: 500 });
        }
        const audioBuffer = Buffer.from(audioContent as Uint8Array);
        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        });

    } catch (error) {
        console.error('Error in Google TTS route:', error);
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