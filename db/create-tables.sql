CREATE TABLE IF NOT EXISTS memories (
    author_id VARCHAR(255) UNIQUE NOT NULL
    content TEXT
)

CREATE TABLE IF NOT EXISTS emojis {
    emoji_id VARCHAR(255) UNIQUE NOT NULL
    used INT
}
