-- Anonymous users (signInAnonymously) can read everything but only non-anonymous
-- users can insert/update/delete universidades, carreras, and materias.
-- Enable "Anonymous Sign-Ins" in Supabase: Authentication -> Providers.
-- Safe to run multiple times: drops policies first, then creates them.

-- Drop policies if they exist (so this script can be re-run)
DROP POLICY IF EXISTS "universidades_insert_not_anon" ON universidades;
DROP POLICY IF EXISTS "universidades_update_not_anon" ON universidades;
DROP POLICY IF EXISTS "universidades_delete_not_anon" ON universidades;
DROP POLICY IF EXISTS "carreras_insert_not_anon" ON carreras;
DROP POLICY IF EXISTS "carreras_update_not_anon" ON carreras;
DROP POLICY IF EXISTS "carreras_delete_not_anon" ON carreras;
DROP POLICY IF EXISTS "materias_insert_own_carrera_not_anon" ON materias;
DROP POLICY IF EXISTS "materias_update_own_carrera_not_anon" ON materias;
DROP POLICY IF EXISTS "materias_delete_own_carrera_not_anon" ON materias;

-- universidades: INSERT/UPDATE/DELETE only for non-anonymous users
CREATE POLICY "universidades_insert_not_anon"
  ON universidades FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');

CREATE POLICY "universidades_update_not_anon"
  ON universidades FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true')
  WITH CHECK ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');

CREATE POLICY "universidades_delete_not_anon"
  ON universidades FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');

-- carreras: INSERT/UPDATE/DELETE only for non-anonymous users
CREATE POLICY "carreras_insert_not_anon"
  ON carreras FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');

CREATE POLICY "carreras_update_not_anon"
  ON carreras FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true')
  WITH CHECK ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');

CREATE POLICY "carreras_delete_not_anon"
  ON carreras FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');

-- materias: replace insert/update/delete to require non-anonymous
DROP POLICY IF EXISTS "materias_insert_own_carrera" ON materias;
DROP POLICY IF EXISTS "materias_update_own_carrera" ON materias;
DROP POLICY IF EXISTS "materias_delete_own_carrera" ON materias;

CREATE POLICY "materias_insert_own_carrera_not_anon"
  ON materias FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  );

CREATE POLICY "materias_update_own_carrera_not_anon"
  ON materias FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  )
  WITH CHECK (
    (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  );

CREATE POLICY "materias_delete_own_carrera_not_anon"
  ON materias FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  );
