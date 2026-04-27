CREATE TABLE share_notes (
    id VARCHAR(26) PRIMARY KEY,
    
    encrypted_title TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    
    is_burn_after_read BOOLEAN DEFAULT FALSE,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_share_notes_expires_at ON share_notes (expires_at);