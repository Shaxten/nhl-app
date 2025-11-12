# Security Fix - Prevent Unauthorized Currency & Username Manipulation

## Problem
Users could use Postman or direct API calls to:
- Gift themselves unlimited money by updating the `currency` field
- Set inappropriate usernames

## Solution
Implemented Row Level Security (RLS) policies and database triggers to:

1. **Prevent Direct Currency Manipulation**
   - Users can NO LONGER directly update their currency
   - Currency is only modified through secure database triggers
   - Bet placement automatically deducts currency via trigger
   - Bet resolution automatically adds winnings via trigger

2. **Username Validation**
   - Username must be 3-20 characters
   - Only alphanumeric, underscore, and hyphen allowed
   - No special characters or inappropriate content

3. **Secure Bet Placement**
   - Currency check happens in database (not client-side)
   - Atomic transaction ensures consistency
   - Users can only place bets for themselves

## How to Apply

### Step 1: Run the SQL in Supabase
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tsgginvjfmfbepdamjpv/editor
2. Open the SQL Editor
3. Copy the entire contents of `security_policies.sql`
4. Execute the SQL

### Step 2: Deploy the Updated Code
The code has been updated to work with the new security model:
- `data.ts` - Removed direct currency updates
- Bet placement now relies on database triggers

### What Changed

**Before:**
```typescript
// Client could manipulate currency directly
await supabase
  .from('profiles')
  .update({ currency: 999999 }) // ❌ Anyone could do this!
  .eq('id', userId);
```

**After:**
```sql
-- Database enforces currency can't be changed by users
CREATE POLICY "Users can update only username"
  ON profiles FOR UPDATE
  WITH CHECK (
    currency = (SELECT currency FROM profiles WHERE id = auth.uid())
  );
```

## Testing
After applying the fix, try these in Postman (they should FAIL):

```javascript
// This should fail - can't update currency
PATCH /rest/v1/profiles?id=eq.USER_ID
{ "currency": 999999 }

// This should fail - invalid username
PATCH /rest/v1/profiles?id=eq.USER_ID
{ "username": "a" } // too short

// This should fail - invalid characters
PATCH /rest/v1/profiles?id=eq.USER_ID
{ "username": "user@#$%" }
```

## Notes
- Existing bets and currency will not be affected
- Users can still update their username (with validation)
- All currency changes now go through secure database functions
