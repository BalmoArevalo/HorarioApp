-- 1. Universidades
CREATE TABLE universidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Carreras (config del grid: primera_hora, duracion_min, descanso_min)
CREATE TABLE carreras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  slug TEXT,
  primera_hora TEXT NOT NULL DEFAULT '06:20',
  duracion_min INT NOT NULL DEFAULT 100,
  descanso_min INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Materias (grupos en JSONB como en el JSON actual)
CREATE TABLE materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrera_id UUID NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  instructor TEXT DEFAULT '',
  grupos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(carrera_id, codigo)
);

-- 4. Vinculación usuario ↔ carrera (un usuario, una carrera por ahora)
CREATE TABLE user_carrera (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  carrera_id UUID NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Horario del usuario (selección de materias y grupos)
CREATE TABLE user_horario (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  carrera_id UUID NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  materia_ids UUID[] NOT NULL DEFAULT '{}',
  seleccion_grupos JSONB NOT NULL DEFAULT '{}',
  config_override JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
