CREATE TABLE IF NOT EXISTS memories (
    author_id VARCHAR(255) UNIQUE NOT NULL,
    server_id VARCHAR(255) NOT NULL,
    content TEXT
);

CREATE TABLE IF NOT EXISTS emojis (
    emoji_id VARCHAR(255) UNIQUE NOT NULL,
    server_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    updated timestamp
);
