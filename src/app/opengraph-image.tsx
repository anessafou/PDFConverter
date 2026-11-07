// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PDFConverter - Free Online PDF & Document Suite';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B0F19 0%, #171E31 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#FF2E54',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 900,
            }}
          >
            P
          </div>
          <span style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1px' }}>
            PDF<span style={{ color: '#FF2E54' }}>Converter</span>
          </span>
        </div>

        <h1
          style={{
            fontSize: '56px',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '900px',
            letterSpacing: '-1.5px',
          }}
        >
          Free Online PDF & Document Suite
        </h1>

        <p
          style={{
            fontSize: '24px',
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Convert, Merge, Compress & Edit Documents Online • 100% Free & Private
        </p>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '40px',
          }}
        >
          {['Word to PDF', 'PDF to Word', 'Merge PDF', 'Compress PDF', 'Image Converter'].map((item) => (
            <div
              key={item}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '8px 20px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#CBD5E1',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}