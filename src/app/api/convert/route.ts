import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Allows streaming large files up to 100MB
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const toolSlug = formData.get('toolSlug') as string | null;
    const targetFormat = formData.get('targetFormat') as string | null;

    if (!file || !toolSlug) {
      return NextResponse.json({ error: 'Missing file or tool definition' }, { status: 400 });
    }

    // =========================================================================
    // HOOK: Connect to your future Go / Python / Docker converter microservice:
    // const backendResponse = await fetch('http://worker-cluster:8080/convert', {
    //   method: 'POST',
    //   body: formData,
    // });
    // return new NextResponse(backendResponse.body, { headers: { ... } });
    // =========================================================================

    // Simulated Server Conversion response (allows testing before backend deployment)
    const arrayBuffer = await file.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.${targetFormat || 'pdf'}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Conversion engine error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}