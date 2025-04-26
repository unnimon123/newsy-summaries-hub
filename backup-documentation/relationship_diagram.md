# Database Relationship Diagram
Created: 2025-04-24 15:53

## Current Database Structure

```mermaid
erDiagram
    auth.users ||--o{ user_roles : "has"
    auth.users ||--|| profiles : "has"
    news ||--o{ saved_articles : "saved_as"
    news }o--|| categories : "belongs_to"
    news ||--o{ article_analytics : "tracks"
    auth.users ||--o{ saved_articles : "saves"
    auth.users ||--o{ article_analytics : "generates"
    auth.users ||--o{ notifications : "receives"
    auth.users ||--o{ news : "creates"

    auth.users {
        uuid id PK
        string email
    }

    profiles {
        uuid id PK,FK
        string username
        string avatar_url
        jsonb notification_preferences
        timestamp created_at
        timestamp updated_at
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        enum role
        timestamp created_at
    }

    news {
        uuid id PK
        text title
        text summary
        text content
        text image_path
        uuid category_id FK
        text source_url
        text source_name
        text source_icon
        enum status
        int view_count
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
        timestamp news_timestamp
    }

    categories {
        uuid id PK
        text name
        text description
        bool is_active
        timestamp created_at
        int article_count
    }

    article_analytics {
        uuid id PK
        uuid article_id FK
        enum event_type
        uuid user_id FK
        timestamp timestamp
        jsonb metadata
    }

    notifications {
        uuid id PK
        text title
        text body
        text target_audience
        text link_to_article
        timestamp scheduled_for
        timestamp sent_at
        uuid created_by FK
        uuid user_id FK
        text type
        bool is_read
        enum audience
    }

    saved_articles {
        uuid id PK
        uuid user_id FK
        uuid article_id FK
        timestamp saved_at
        bool is_read
    }
```

## Proposed Advertisement Structure

```mermaid
erDiagram
    ad_campaigns ||--o{ advertisements : "contains"
    advertisements ||--o{ ad_analytics : "tracks"
    auth.users ||--o{ ad_campaigns : "creates"
    auth.users ||--o{ ad_analytics : "generates"
    categories ||--o{ ad_campaigns : "targets"

    ad_campaigns {
        uuid id PK
        text title
        text description
        enum status
        timestamp start_date
        timestamp end_date
        decimal total_budget
        int display_frequency
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    advertisements {
        uuid id PK
        uuid campaign_id FK
        text title
        text image_url
        text cta_text
        text cta_url
        int priority
        bool is_active
        timestamp created_at
        timestamp updated_at
    }

    ad_analytics {
        uuid id PK
        uuid ad_id FK
        uuid user_id FK
        enum event_type
        timestamp occurred_at
        jsonb metadata
    }
```

## Notes

1. The advertisement structure follows similar patterns to existing tables:
   - UUID primary keys
   - Created/updated timestamps
   - Status tracking
   - Analytics tracking

2. Key relationships:
   - Campaigns contain multiple advertisements
   - Advertisements generate analytics events
   - Users create campaigns
   - Users generate ad analytics events
   - Campaigns can target specific categories

3. Safety features:
   - Similar structure to existing tables enables familiar backup/restore
   - Status fields allow gradual rollout
   - Analytics structure matches existing pattern
