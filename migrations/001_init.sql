CREATE TABLE IF NOT EXISTS messages (
id TEXT PRIMARY KEY,
author TEXT,
text TEXT,
ts INTEGER
);


CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages(ts DESC);
