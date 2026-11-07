// src/app/sitemaps/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const canonicalUrl = new URL(`/sitemap-${id}.xml`, request.url);
  return NextResponse.redirect(canonicalUrl, 301);
}