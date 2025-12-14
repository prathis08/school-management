CREATE TABLE users (
    id UUID PRIMARY KEY NOT NULL,
    user_id VARCHAR(255),
    schoolId VARCHAR(50),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE tokens (
    id UUID PRIMARY KEY NOT NULL,
    token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'access',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    device_info JSON,
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX tokens_expires_at ON tokens (expires_at);
CREATE INDEX tokens_is_revoked ON tokens (is_revoked);
CREATE INDEX tokens_type ON tokens (type);
CREATE INDEX tokens_user_id ON tokens (user_id);