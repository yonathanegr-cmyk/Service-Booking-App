# Beed - Database Entity Relationship Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UNIFIED DATABASE                                   │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │   CLIENT    │      │   BOOKING   │      │     PRO     │                 │
│  │    APP      │◄────►│   (PIVOT)   │◄────►│    APP      │                 │
│  └─────────────┘      └──────┬──────┘      └─────────────┘                 │
│                              │                                              │
│                              ▼                                              │
│                       ┌─────────────┐                                       │
│                       │    ADMIN    │                                       │
│                       │  DASHBOARD  │                                       │
│                       └─────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ERD Diagram (Mermaid)

```mermaid
erDiagram
    %% ============================================
    %% CORE ENTITIES
    %% ============================================
    
    PROFILES {
        uuid id PK "References auth.users"
        text email UK
        user_role role "admin|client|provider"
        text full_name
        text phone
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }
    
    CLIENTS {
        uuid id PK,FK "References profiles"
        jsonb default_address
        jsonb payment_methods_token
    }
    
    PROVIDERS {
        uuid id PK,FK "References profiles"
        boolean is_verified
        float rating_avg
        jsonb skills
        jsonb insurance_docs
        geography current_location
    }
    
    %% ============================================
    %% THE PIVOT: BOOKINGS
    %% ============================================
    
    BOOKINGS {
        uuid id PK
        uuid client_id FK "NOT NULL"
        uuid provider_id FK "Can be NULL initially"
        booking_status status
        text category
        text title
        text description
        text location_address
        text location_building_code "SENSITIVE - Digicode"
        text location_floor
        text location_apartment
        geography location_coords
        timestamptz scheduled_for
        decimal estimated_price
        decimal final_price
        text currency
        integer client_rating
        text client_review
        integer pro_rating
        text pro_review
        boolean is_flagged
        text admin_notes
        timestamptz created_at
        timestamptz updated_at
    }
    
    %% ============================================
    %% COMMUNICATION
    %% ============================================
    
    MESSAGES {
        uuid id PK
        uuid booking_id FK
        uuid sender_id FK
        text content
        boolean is_read
        timestamptz created_at
    }
    
    BOOKING_EVENTS {
        uuid id PK
        uuid booking_id FK
        event_type event_type
        text description
        jsonb metadata
        timestamptz created_at
    }
    
    %% ============================================
    %% MEDIA & PROOFS
    %% ============================================
    
    BOOKING_MEDIA {
        uuid id PK
        uuid booking_id FK
        uuid uploader_id FK
        text media_url
        media_type media_type "image|video"
        media_stage stage "before|after|incident"
        timestamptz created_at
    }
    
    %% ============================================
    %% DISPUTES (LITIGES)
    %% ============================================
    
    DISPUTES {
        uuid id PK
        uuid booking_id FK "CRITICAL LINK"
        uuid created_by FK
        user_role created_by_role
        dispute_reason reason
        text description
        jsonb evidence_urls
        dispute_status status
        uuid assigned_admin FK
        text resolution_notes
        decimal refund_amount
        decimal compensation_amount
        timestamptz created_at
        timestamptz resolved_at
    }
    
    DISPUTE_MESSAGES {
        uuid id PK
        uuid dispute_id FK
        uuid sender_id FK
        text message
        boolean is_internal "Admin-only notes"
        timestamptz created_at
    }
    
    %% ============================================
    %% FINANCIALS
    %% ============================================
    
    INVOICES {
        uuid id PK
        uuid booking_id FK
        invoice_status status
        float total_amount
        float tip_amount
        float platform_fee
        text stripe_payment_intent_id
        timestamptz paid_at
    }
    
    INVOICE_ITEMS {
        uuid id PK
        uuid invoice_id FK
        text label
        float amount
        cost_item_type type
    }
    
    COMMISSIONS {
        uuid id PK
        uuid booking_id FK
        commission_type type
        decimal amount
        decimal percentage
        timestamptz collected_at
    }
    
    %% ============================================
    %% ADMIN AUDIT
    %% ============================================
    
    ADMIN_AUDIT_LOGS {
        uuid id PK
        uuid admin_id FK
        text action
        text target_table
        uuid target_id
        jsonb old_values
        jsonb new_values
        inet ip_address
        timestamptz created_at
    }
    
    %% ============================================
    %% RELATIONSHIPS
    %% ============================================
    
    PROFILES ||--o| CLIENTS : "extends"
    PROFILES ||--o| PROVIDERS : "extends"
    
    PROFILES ||--o{ BOOKINGS : "client_id"
    PROFILES ||--o{ BOOKINGS : "provider_id"
    
    BOOKINGS ||--o{ MESSAGES : "has"
    BOOKINGS ||--o{ BOOKING_EVENTS : "logs"
    BOOKINGS ||--o{ BOOKING_MEDIA : "contains"
    BOOKINGS ||--o{ DISPUTES : "may have"
    BOOKINGS ||--|| INVOICES : "generates"
    BOOKINGS ||--o{ COMMISSIONS : "accrues"
    
    DISPUTES ||--o{ DISPUTE_MESSAGES : "has thread"
    PROFILES ||--o{ DISPUTES : "creates"
    PROFILES ||--o{ DISPUTES : "assigned_admin"
    
    INVOICES ||--o{ INVOICE_ITEMS : "contains"
    
    PROFILES ||--o{ ADMIN_AUDIT_LOGS : "admin actions"
```

## Data Flow per Interface

### 1. Client App Flow
```
CLIENT ──► creates BOOKING ──► receives MESSAGES ──► can open DISPUTE
                │
                └──► views PRO (public info only)
```

### 2. Pro App Flow
```
PRO ──► accepts BOOKING ──► sees ADDRESS (only if confirmed)
                │                    │
                │                    └──► sees DIGICODE (only if en_route)
                │
                └──► sends MESSAGES ──► uploads MEDIA (before/after)
```

### 3. Admin Dashboard Flow
```
ADMIN ──► sees ALL BOOKINGS (full data)
    │
    ├──► manages DISPUTES ──► sees full TIMELINE
    │         │
    │         └──► accesses BOOKING_MEDIA as evidence
    │
    ├──► views COMMISSIONS per booking
    │
    └──► all actions logged in ADMIN_AUDIT_LOGS
```

## SQL Views Summary

| View Name | Target Interface | Data Visibility |
|-----------|------------------|-----------------|
| `view_client_bookings` | Client App | Pro public info, own address, own ratings |
| `view_pro_bookings` | Pro App | Client address (if confirmed), digicode (if en_route) |
| `view_admin_bookings` | Admin Dashboard | ALL data: financials, disputes, logs, media |
| `view_admin_disputes` | Admin Dashboard | Full dispute context with booking timeline |

## Key Security Rules

1. **Digicode Protection**: Only visible when `status IN ('en_route', 'in_progress', 'completed')`
2. **Client Address**: Only visible to Pro when `status IN ('accepted', 'en_route', 'in_progress', 'completed')`
3. **Financial Data**: Only visible to Admin role
4. **Audit Logs**: All admin actions are automatically logged
5. **RLS Policies**: Each table has Row Level Security based on user role

## Dispute → Booking Relationship

```sql
-- Admin can access full booking context from any dispute
SELECT 
    d.*,
    b.*,  -- Full booking data
    (SELECT json_agg(e.*) FROM booking_events e WHERE e.booking_id = d.booking_id) AS timeline,
    (SELECT json_agg(m.*) FROM booking_media m WHERE m.booking_id = d.booking_id) AS media
FROM disputes d
JOIN bookings b ON d.booking_id = b.id
WHERE d.id = 'dispute-uuid';
```

This allows admin to see the complete history of a mission when investigating a dispute.
