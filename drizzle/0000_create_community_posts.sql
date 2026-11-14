CREATE TABLE IF NOT EXISTS community_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL DEFAULT 'Rise member',
  topic TEXT NOT NULL CHECK (topic IN ('Movement', 'Cycle & hormones', 'Mindset')),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 5 AND 400),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS community_posts_status_created ON community_posts(status, created_at DESC);
INSERT INTO community_posts (display_name, topic, body, status) VALUES
  ('Nia', 'Movement', 'I swapped my planned run for a walk and it was exactly what I needed. A win is a win.', 'approved'),
  ('Amara', 'Cycle & hormones', 'Trying to be more curious and less critical about the days my energy dips. What helps you be gentle with yourself?', 'approved'),
  ('Leah', 'Mindset', 'Little reminder: starting small still counts. Ten minutes of stretching made my evening feel lighter.', 'approved');
