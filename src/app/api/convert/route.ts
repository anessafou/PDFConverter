// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const toolSlug = formData.get('toolSlug') as string | null;
    const targetFormat = (formData.get('targetFormat') as string | null) || 'docx';

    if (!file || !toolSlug) {
      return NextResponse.json(
        { error: 'Missing required file or tool parameters.' },
        { status: 400 }
      );
    }

    // Process file in-memory buffer safely without filesystem writes
    const arrayBuffer = await file.arrayBuffer();
    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted';
    const outputFilename = `${originalName}.${targetFormat}`;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(outputFilename)}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    console.error('Conversion Route Error:', error);
    const message = error instanceof Error ? error.message : 'Server conversion error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}