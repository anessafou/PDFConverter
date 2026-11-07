-- scripts/schema-postgres.sql

-- Reviews storage table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    item_slug VARCHAR(128) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_item_status ON reviews(item_slug, status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Persistent distributed rate-limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(128) PRIMARY KEY,
    points INT NOT NULL DEFAULT 1,
    expire_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expire ON rate_limits(expire_at);