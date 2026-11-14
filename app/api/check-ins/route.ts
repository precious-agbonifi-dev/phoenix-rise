import { env } from 'cloudflare:workers';

const allowedMoods = new Set(['Low', 'A bit low', 'Okay', 'Good', 'Great']);
const allowedSymptoms = new Set(['Cramps', 'Low mood', 'Tired', 'Headache', 'Nothing in particular']);
type CheckinRow = { date: string; mood: string; energy: number; symptoms: string; updatedAt: string };

function userIdFrom(request: Request) {
  return request.headers.get('oai-authenticated-user-id')?.trim() || null;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export async function GET(request: Request) {
  const userId = userIdFrom(request);
  if (!userId) return Response.json({ error: 'Sign in to view private check-ins.' }, { status: 401, headers: { 'cache-control': 'no-store' } });

  const date = new URL(request.url).searchParams.get('date');
  if (date && !validDate(date)) return Response.json({ error: 'Use a valid date.' }, { status: 400 });

  if (date) {
    const row = await env.DB.prepare('SELECT checkin_date AS date, mood, energy, symptoms_json AS symptoms, updated_at AS updatedAt FROM checkins WHERE user_id = ? AND checkin_date = ? LIMIT 1').bind(userId, date).first<CheckinRow>();
    return Response.json({ checkin: row ? { ...row, symptoms: JSON.parse(row.symptoms || '[]') } : null }, { headers: { 'cache-control': 'no-store' } });
  }

  const result = await env.DB.prepare('SELECT checkin_date AS date, mood, energy, symptoms_json AS symptoms, updated_at AS updatedAt FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT 30').bind(userId).all<CheckinRow>();
  return Response.json({ checkins: (result.results ?? []).map(row => ({ ...row, symptoms: JSON.parse(row.symptoms || '[]') })) }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request: Request) {
  const userId = userIdFrom(request);
  if (!userId) return Response.json({ error: 'Sign in to save private check-ins.' }, { status: 401, headers: { 'cache-control': 'no-store' } });

  let input: { date?: unknown; mood?: unknown; energy?: unknown; symptoms?: unknown };
  try { input = await request.json(); } catch { return Response.json({ error: 'Please send a valid check-in.' }, { status: 400 }); }
  const date = typeof input.date === 'string' ? input.date : '';
  const mood = typeof input.mood === 'string' ? input.mood : '';
  const energy = Number(input.energy);
  const symptoms = Array.isArray(input.symptoms) ? [...new Set(input.symptoms.filter((item): item is string => typeof item === 'string' && allowedSymptoms.has(item)))] : [];

  if (!validDate(date)) return Response.json({ error: 'Use a valid check-in date.' }, { status: 400 });
  if (!allowedMoods.has(mood)) return Response.json({ error: 'Choose a listed mood.' }, { status: 400 });
  if (!Number.isInteger(energy) || energy < 1 || energy > 5) return Response.json({ error: 'Energy must be between 1 and 5.' }, { status: 400 });

  await env.DB.prepare("INSERT INTO checkins (user_id, checkin_date, mood, energy, symptoms_json) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, checkin_date) DO UPDATE SET mood = excluded.mood, energy = excluded.energy, symptoms_json = excluded.symptoms_json, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
    .bind(userId, date, mood, energy, JSON.stringify(symptoms)).run();

  return Response.json({ saved: true, date, message: 'Check-in saved to your private account. Cycle details stay on this device.' }, { headers: { 'cache-control': 'no-store' } });
}
