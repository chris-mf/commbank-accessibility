import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { DEFAULT_CARDS, KV_KEY, type CardOverride } from '@/lib/cards';

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(DEFAULT_CARDS);
    }

    const overrides = await redis.get<Record<string, CardOverride>>(KV_KEY);

    const cards = DEFAULT_CARDS.map((def) => {
      const override = overrides?.[def.id];
      return override ? { ...def, title: override.title, hmw: override.hmw } : def;
    });

    return NextResponse.json(cards);
  } catch (e) {
    console.warn('Redis unavailable, returning defaults:', e);
    return NextResponse.json(DEFAULT_CARDS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { id, title, hmw } = body as { id: string; title: string; hmw: string };

    if (!id || !title || !hmw) {
      return NextResponse.json({ error: 'Missing id, title, or hmw' }, { status: 400 });
    }

    if (!DEFAULT_CARDS.some((c) => c.id === id)) {
      return NextResponse.json({ error: 'Unknown card id' }, { status: 400 });
    }

    const overrides = (await redis.get<Record<string, CardOverride>>(KV_KEY)) ?? {};
    overrides[id] = { title, hmw };
    await redis.set(KV_KEY, overrides);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Redis write failed:', e);
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}
