# Database Table Structures
Created: 2025-04-24 15:47

## `news` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| title | text | NO | - | News article title |
| summary | text | NO | - | Brief summary of the article |
| content | text | YES | - | Full article content |
| image_path | text | YES | - | Path to article image |
| category_id | uuid | YES | - | Foreign key to categories.id |
| source_url | text | YES | - | Original article URL |
| source_name | text | YES | - | Name of news source |
| source_icon | text | YES | - | Icon of news source |
| status | news_status | NO | 'draft' | Article status |
| view_count | integer | NO | 0 | Number of views |
| created_by | uuid | YES | - | Foreign key to users.id |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update timestamp |
| news_timestamp | timestamptz | YES | - | Article publication time |

### Foreign Key Relationships
1. `category_id` references `categories(id)`
2. `created_by` references `users(id)`

### Important Notes
1. Status is using a custom enum type `news_status`
2. Multiple timestamp fields for different purposes:
   - created_at: Record creation time
   - updated_at: Last modification time
   - news_timestamp: Actual article publication time

### Implications for Advertisement Implementation
1. Our advertisement system will need to work alongside this structure
2. Advertisements will need to be inserted between news items
3. Status tracking similar to news_status might be useful for ads
4. View tracking similar to view_count will be needed for ad analytics

## `categories` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Category name |
| description | text | YES | - | Category description |
| is_active | boolean | NO | true | Category status |
| created_at | timestamptz | NO | now() | Creation timestamp |
| article_count | integer | YES | 0 | Number of articles in category |

### Important Notes
1. Categories are referenced by news articles via `category_id`
2. Categories maintain their own article count
3. Categories can be deactivated without deletion (is_active flag)

### Implications for Advertisement Implementation
1. Could be used for ad targeting by category
2. Active/inactive status pattern could be reused for ad campaigns
3. Category relationships could influence ad placement strategy

## `user_roles` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Foreign key to auth.users(id) |
| role | user_role | NO | 'user' | User's role (custom enum) |
| created_at | timestamptz | NO | now() | Creation timestamp |

### Important Notes
1. Uses custom enum type `user_role`
2. Direct relationship with auth.users table
3. Default role is 'user'
4. No deletion timestamps (records preserved for audit)

### Implications for Advertisement Implementation
1. Will need to ensure only users with appropriate roles can:
   - Create/edit ad campaigns
   - Manage advertisements
   - View analytics
   - Configure ad settings
2. May need to consider adding specific ad-related roles
3. Important for RLS policies on new ad-related tables

## `profiles` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | - | Primary key, Foreign key to auth.users(id) |
| username | text | YES | - | User's display name |
| avatar_url | text | YES | - | User's avatar image URL |
| notification_preferences | jsonb | YES | '{"push": true, "email": false}' | User's notification settings |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update timestamp |

### Important Notes
1. Direct 1:1 relationship with auth.users table
2. Primary key is also a foreign key to auth.users(id)
3. Flexible notification preferences using JSONB
4. Timestamps for auditing

### Implications for Advertisement Implementation
1. Can link ad campaign creators to their profiles
2. Notification preferences could be extended for ad-related notifications:
   - Campaign status changes
   - Performance metrics
   - Budget alerts
3. Profile information could be used for:
   - Ad campaign attribution
   - Activity logging
   - Administrative tracking

## `article_analytics` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| article_id | uuid | NO | - | Foreign key to news(id) |
| event_type | USER-DEFINED | NO | - | Type of analytics event |
| user_id | uuid | YES | - | Foreign key to auth.users(id) |
| timestamp | timestamptz | NO | now() | Event timestamp |
| metadata | jsonb | YES | - | Additional event data |

### Important Notes
1. Uses custom enum type for event_type
2. Flexible metadata storage using JSONB
3. Links events to both articles and users
4. Captures anonymous events (user_id nullable)

### Implications for Advertisement Implementation
1. Ad analytics can follow similar structure:
   - Track views/clicks per ad
   - Store user interaction data
   - Capture metadata (device, location, etc.)
2. Can adapt event_type pattern for ad events:
   - impression
   - click
   - conversion
3. JSONB metadata allows for extensible tracking:
   - View duration
   - Interaction details
   - Campaign context

## `notifications` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| title | text | NO | - | Notification title |
| body | text | NO | - | Notification content |
| target_audience | text | NO | - | Target recipients |
| link_to_article | text | YES | - | Related article link |
| scheduled_for | timestamptz | YES | - | Scheduled send time |
| sent_at | timestamptz | YES | - | Actual send time |
| created_by | uuid | YES | - | Foreign key to auth.users(id) |
| created_at | timestamptz | NO | now() | Creation timestamp |
| user_id | uuid | YES | - | Foreign key to auth.users(id) |
| type | text | NO | 'web' | Notification type |
| is_read | boolean | NO | false | Read status |
| audience | notification_audience | NO | 'all' | Audience type (enum) |

### Important Notes
1. Supports scheduled notifications
2. Tracks read status
3. Multiple audience targeting options
4. Flexible notification types
5. Links to both creator and recipient

### Implications for Advertisement Implementation
1. Can use similar structure for ad-related notifications:
   - Campaign start/end alerts
   - Performance milestone notifications
   - Budget alerts
   - Approval notifications
2. Scheduling system can be used for:
   - Campaign scheduling
   - Performance report delivery
   - Budget update notifications
3. Audience targeting can be adapted for:
   - Ad managers
   - Campaign owners
   - Finance team

## `saved_articles` Table Structure

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|----------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Foreign key to auth.users(id) |
| article_id | uuid | NO | - | Foreign key to news(id) |
| saved_at | timestamptz | NO | now() | Save timestamp |
| is_read | boolean | NO | false | Read status |

### Important Notes
1. Links users to articles they've saved
2. Tracks read status
3. Has mandatory user and article associations
4. Records exact save timestamp

### Implications for Advertisement Implementation
1. Could be adapted for saved/favorited ads
2. Read status pattern could be used for:
   - Tracking viewed ads
   - Marking clicked ads
3. User-content relationship pattern useful for:
   - Ad preferences
   - Personalization features
   - Targeted ad history

## Next Steps
1. Create entity relationship diagram showing connections between:
   - Existing tables
   - Proposed ad-related tables
2. Document RLS policies for each table
3. Design new ad-related tables based on learned patterns
