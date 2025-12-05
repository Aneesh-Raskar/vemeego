-- Fix meetings RLS policy to properly handle INSERT operations
-- The original policy used FOR ALL with only USING clause, which doesn't work for INSERT
-- INSERT operations require WITH CHECK clause
-- Note: Service role key should bypass RLS, but having proper policies ensures consistency
-- and allows the policy to work correctly if RLS is not bypassed for any reason

-- Drop the existing policy
DROP POLICY IF EXISTS "Manage meetings" ON meetings;

-- Recreate the policy with both USING and WITH CHECK for proper INSERT support
-- FOR ALL means this applies to SELECT, INSERT, UPDATE, DELETE
-- USING applies to SELECT, UPDATE, DELETE (checks existing rows)
-- WITH CHECK applies to INSERT, UPDATE (checks new/modified rows)
CREATE POLICY "Manage meetings" ON meetings
    FOR ALL
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

