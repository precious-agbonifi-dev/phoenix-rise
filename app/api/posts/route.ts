import { env } from 'cloudflare:workers';

const allowedTopics = new Set(['Movement', 'Cycle & hormones', 'Mindset']);

type PostRow = { id: number; name: string; topic: string; text: string; createdAt: string };

export async function GET(request: Request) {
  const topic = new URL(request.url).searchParams.get('topic');
  const result = topic && allowedTopics.has(topic)
    ? await env.DB.prepare('SELECT id, display_name AS name, topic, body AS text, created_at AS createdAt FROM community_posts WHERE status = ? AND topic = ? ORDER BY created_at DESC LIMIT 50').bind('approved', topic).all<PostRow>()
    : await env.DB.prepare('SELECT id, display_name AS name, topic, body AS text, created_at AS createdAt FROM community_posts WHERE status = ? ORDER BY created_at DESC LIMIT 50').bind('approved').all<PostRow>();
  return Response.json({ posts: result.results ?? [] }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request: Request) {
  let input: { topic?: unknown; text?: unknown; name?: unknown };
  try { input = await request.json(); } catch { return Response.json({ error: 'Please send a valid post.' }, { status: 400 }); }
  const topic = typeof input.topic === 'string' ? input.topic : '';
  const text = typeof input.text === 'string' ? input.text.trim() : '';
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 32) : '';
  if (!allowedTopics.has(topic)) return Response.json({ error: 'Choose one of the listed community topics.' }, { status: 400 });
  if (text.length < 5 || text.length > 400) return Response.json({ error: 'Posts must be between 5 and 400 characters.' }, { status: 400 });

  const result = await env.DB.prepare('INSERT INTO community_posts (display_name, topic, body, status) VALUES (?, ?, ?, ?)')
    .bind(name || 'Rise member', topic, text, 'pending').run();
  return Response.json({ accepted: true, id: result.meta.last_row_id, message: 'Thanks for sharing. Your post is waiting for review before it appears in the circle.' }, { status: 202 });
}
