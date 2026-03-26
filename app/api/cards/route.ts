import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { DEFAULT_CARDS, type CardOverride } from '@/lib/cards';

const BLOB_NAME = 'cards.json';

async function getOverrides(): Promise<Record<string, CardOverride>> {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length === 0) return {};
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const overrides = await getOverrides();

    const cards = DEFAULT_CARDS.map((def) => {
      const override = overrides?.[def.id];
      return override ? { ...def, title: override.title, hmw: override.hmw } : def;
    });

    return NextResponse.json(cards);
  } catch (e) {
    console.warn('Blob unavailable, returning defaults:', e);
    return NextResponse.json(DEFAULT_CARDS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, hmw } = body as { id: string; title: string; hmw: string };

    if (!id || !title || !hmw) {
      return NextResponse.json({ error: 'Missing id, title, or hmw' }, { status: 400 });
    }

    if (!DEFAULT_CARDS.some((c) => c.id === id)) {
      return NextResponse.json({ error: 'Unknown card id' }, { status: 400 });
    }

    const overrides = await getOverrides();
    overrides[id] = { title, hmw };

    await put(BLOB_NAME, JSON.stringify(overrides), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Blob write failed:', e);
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}
