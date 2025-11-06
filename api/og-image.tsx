/* @ts-nocheck */
// @vercel/og has its own JSX runtime, doesn't need React
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Iconify';
    const description = searchParams.get('description') || 'Free Image & Emoji to ICO/PWA Icon Converter';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#667eea',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
          }}
        >
          {/* Main Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
            }}
          >
            <h1
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              {description}
            </p>
          </div>

          {/* Icon Preview - Using Unicode symbols instead of emojis */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 40,
              gap: 20,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ✨
            </div>
            <div
              style={{
                fontSize: 40,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              →
            </div>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ⚡
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            iconify.dev
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image generation error:', e);
    return new Response(`Failed to generate image: ${e.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

