CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('Low', 'A bit low', 'Okay', 'Good', 'Great')),
  energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
  symptoms_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(symptoms_json)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS checkins_user_date ON checkins(user_id, checkin_date DESC);
