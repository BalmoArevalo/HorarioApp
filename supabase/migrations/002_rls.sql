-- Enable RLS on all tables
ALTER TABLE universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carrera ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_horario ENABLE ROW LEVEL SECURITY;

-- universidades: read for authenticated users
CREATE POLICY "universidades_select_authenticated"
  ON universidades FOR SELECT
  TO authenticated
  USING (true);

-- carreras: read for authenticated users
CREATE POLICY "carreras_select_authenticated"
  ON carreras FOR SELECT
  TO authenticated
  USING (true);

-- materias: read for authenticated; insert/update only for users in that carrera
CREATE POLICY "materias_select_authenticated"
  ON materias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "materias_insert_own_carrera"
  ON materias FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  );

CREATE POLICY "materias_update_own_carrera"
  ON materias FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  );

CREATE POLICY "materias_delete_own_carrera"
  ON materias FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_carrera
      WHERE user_id = auth.uid() AND carrera_id = materias.carrera_id
    )
  );

-- user_carrera: user can only manage own row
CREATE POLICY "user_carrera_select_own"
  ON user_carrera FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_carrera_insert_own"
  ON user_carrera FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_carrera_update_own"
  ON user_carrera FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_horario: user can only manage own row
CREATE POLICY "user_horario_select_own"
  ON user_horario FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_horario_insert_own"
  ON user_horario FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_horario_update_own"
  ON user_horario FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

