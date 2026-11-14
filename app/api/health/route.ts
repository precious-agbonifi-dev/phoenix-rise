import { env } from 'cloudflare:workers';

export async function GET() {
  const result = await env.DB.prepare('SELECT 1 AS ready').first<{ ready: number }>();
  return Response.json({ ok: result?.ready === 1, service: 'Phoenix Rise API', storage: 'Cloudflare D1' });
}
