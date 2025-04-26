# Row Level Security (RLS) Policies
Created: 2025-04-24 16:07

## Current RLS Policies by Table

### Categories Table
1. **Anyone can read categories**
   - Role: public
   - Command: SELECT
   - Condition: true (unrestricted)

2. **Only admins can insert categories**
   - Role: public
   - Command: INSERT
   - Check: is_admin(auth.uid())

3. **Only admins can update categories**
   - Role: public
   - Command: UPDATE
   - Condition: is_admin(auth.uid())

4. **Only admins can delete categories**
   - Role: public
   - Command: DELETE
   - Condition: is_admin(auth.uid())

### News Table
1. **Anyone can read published news**
   - Role: public
   - Command: SELECT
   - Condition: status = 'published' OR is_admin(auth.uid())

2. **Only admins can insert news**
   - Role: public
   - Command: INSERT
   - Check: is_admin(auth.uid())

3. **Only admins can update news**
   - Role: public
   - Command: UPDATE
   - Condition: is_admin(auth.uid())

4. **Only admins can delete news**
   - Role: public
   - Command: DELETE
   - Condition: is_admin(auth.uid())

### Profiles Table
1. **Users can read their own profile**
   - Role: public
   - Command: SELECT
   - Condition: auth.uid() = id OR is_admin(auth.uid())

2. **Users can insert their own profile**
   - Role: public
   - Command: INSERT
   - Check: auth.uid() = id

3. **Users can update their own profile**
   - Role: public
   - Command: UPDATE
   - Condition: auth.uid() = id

### Saved Articles Table
1. **Users can view their own saved articles**
   - Role: public
   - Command: SELECT
   - Condition: auth.uid() = user_id OR is_admin(auth.uid())

2. **Users can save articles**
   - Role: public
   - Command: INSERT
   - Check: auth.uid() = user_id

3. **Users can update their saved articles**
   - Role: public
   - Command: UPDATE
   - Condition: auth.uid() = user_id

4. **Users can delete their saved articles**
   - Role: public
   - Command: DELETE
   - Condition: auth.uid() = user_id

### Article Analytics Table
1. **Anyone can insert analytics**
   - Role: public
   - Command: INSERT
   - Check: true (unrestricted)

2. **Only admins can view analytics**
   - Role: public
   - Command: SELECT
   - Condition: is_admin(auth.uid())

### User Roles Table
1. **Only admins can manage user roles**
   - Role: public
   - Command: ALL
   - Condition: is_admin(auth.uid())

2. **Users can view their own role**
   - Role: public
   - Command: SELECT
   - Condition: auth.uid() = user_id

### Notifications Table
1. **Admins can manage notifications**
   - Role: public
   - Command: ALL
   - Condition: is_admin(auth.uid())

2. **Users can view their own notifications**
   - Role: authenticated
   - Command: SELECT
   - Complex condition: Based on user_id, audience type, and notification preferences

3. **Users can update is_read status**
   - Role: authenticated
   - Command: UPDATE
   - Condition: user_id = auth.uid()

## Implications for Advertisement Implementation

### Required RLS Policies for New Tables

1. **Ad Campaigns Table**
```sql
-- Only admins can manage campaigns
CREATE POLICY "Admins can manage ad campaigns"
ON public.ad_campaigns
FOR ALL
TO public
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Anyone can view active campaigns
CREATE POLICY "Anyone can view active campaigns"
ON public.ad_campaigns
FOR SELECT
TO public
USING (status = 'active');
```

2. **Advertisements Table**
```sql
-- Only admins can manage advertisements
CREATE POLICY "Admins can manage advertisements"
ON public.advertisements
FOR ALL
TO public
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Anyone can view active ads from active campaigns
CREATE POLICY "Anyone can view active ads"
ON public.advertisements
FOR SELECT
TO public
USING (
    is_active = true 
    AND EXISTS (
        SELECT 1 FROM ad_campaigns ac 
        WHERE ac.id = advertisements.campaign_id 
        AND ac.status = 'active'
    )
);
```

3. **Ad Analytics Table**
```sql
-- Anyone can insert analytics (like article_analytics)
CREATE POLICY "Anyone can insert ad analytics"
ON public.ad_analytics
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Only admins can view ad analytics"
ON public.ad_analytics
FOR SELECT
TO public
USING (is_admin(auth.uid()));
```

## Safety Considerations

1. **Consistent Admin Control**
   - All management operations restricted to admins
   - Follows existing pattern from news and categories

2. **Public Access Control**
   - Read access to active ads only
   - Similar to news article publishing workflow

3. **Analytics Security**
   - Anonymous event recording allowed
   - Analysis restricted to admins

4. **Rollback Safety**
   - All policies can be rolled back with CASCADE
   - Separate enable/disable from data deletion
