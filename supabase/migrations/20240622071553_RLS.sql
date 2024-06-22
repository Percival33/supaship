CREATE POLICY "all can see" ON "public"."user_profiles"
    AS PERMISSIVE FOR SELECT
    TO public
    USING (true);

CREATE POLICY "users can insert" ON "public"."user_profiles"
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners can update" ON "public"."user_profiles"
    AS PERMISSIVE FOR UPDATE
    TO public
    USING (auth.uid()=user_id)
    WITH CHECK (auth.uid()=user_id);