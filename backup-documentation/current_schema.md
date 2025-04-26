# Current Database Schema Documentation
Created: 2025-04-24 15:46

## Schema Overview

| Schema Name | Size | Table Count |
|------------|------|-------------|
| auth | 1320 kB | 16 |
| realtime | 272 kB | 10 |
| public | 224 kB | 7 |
| storage | 248 kB | 5 |
| vault | 24 kB | 1 |
| extensions | 0 bytes | 0 |
| graphql | 0 bytes | 0 |
| graphql_public | 0 bytes | 0 |

## Notes
- Main application tables are in the `public` schema
- Total number of tables in public schema: 7
- Current public schema size: 224 kB

## Public Schema Tables

| Table Name | Type | Size | Rows | Columns | Indexes |
|------------|------|------|------|---------|---------|
| categories | BASE TABLE | 49152 bytes | 5 | 6 | 2 |
| saved_articles | BASE TABLE | 40960 bytes | 1 | 5 | 2 |
| user_roles | BASE TABLE | 40960 bytes | 14 | 4 | 2 |
| news | BASE TABLE | 32768 bytes | 5 | 15 | 1 |
| profiles | BASE TABLE | 32768 bytes | 14 | 6 | 1 |
| article_analytics | BASE TABLE | 16384 bytes | 0 | 6 | 1 |
| notifications | BASE TABLE | 16384 bytes | 0 | 13 | 1 |

## Important Observations
1. Current tables are well-structured with proper indexes
2. News table has the most columns (15)
3. User-related tables (profiles, user_roles) have consistent row counts
4. Analytics and notifications tables are prepared but currently empty

## Next Steps
1. Document detailed table structures including column definitions
2. Map relationships between tables (foreign keys)
3. Document RLS policies
4. Create rollback verification queries
