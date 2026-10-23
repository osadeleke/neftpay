-- Cloudflare D1 (SQLite) Schema for NEFTrack
-- Part-payment tracking SaaS for SMEs in Nigeria
-- Monetary values stored as integers in KOBO (100 Kobo = 1 Naira)

-- 1. Merchants Table
CREATE TABLE IF NOT EXISTS Merchants (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    address TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free',
    currency TEXT NOT NULL DEFAULT 'NGN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Verification Codes Table (For secure 6-digit Email OTP login)
CREATE TABLE IF NOT EXISTS VerificationCodes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS Clients (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
);

-- 3. Agreements Table
CREATE TABLE IF NOT EXISTS Agreements (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    title TEXT NOT NULL,
    total_amount INTEGER NOT NULL, -- Stored as integer in Kobo (e.g. ₦50,000 = 5000000)
    magic_link_slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'overdue' | 'cancelled'
    due_date DATETIME,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES Clients(id) ON DELETE CASCADE
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    id TEXT PRIMARY KEY,
    agreement_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Stored as integer in Kobo (e.g. ₦15,000 = 1500000)
    payment_method TEXT NOT NULL, -- 'Bank Transfer' | 'Cash' | 'POS' | 'USSD'
    reference_note TEXT,
    receipt_sent INTEGER NOT NULL DEFAULT 0, -- 0 = No, 1 = Yes (WhatsApp sent)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agreement_id) REFERENCES Agreements(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clients_merchant ON Clients(merchant_id);
CREATE INDEX IF NOT EXISTS idx_agreements_merchant ON Agreements(merchant_id);
CREATE INDEX IF NOT EXISTS idx_agreements_client ON Agreements(client_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agreements_slug ON Agreements(magic_link_slug);
CREATE INDEX IF NOT EXISTS idx_payments_agreement ON Payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON Payments(created_at);
