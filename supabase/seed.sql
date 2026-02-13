-- Run after 001_initial_schema.sql and 002_rls.sql in Supabase SQL Editor.
-- Seed: UES + Ingeniería en Sistemas Informáticos + materias desde data/horario.json

INSERT INTO universidades (id, nombre, slug) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Universidad de El Salvador', 'ues');

INSERT INTO carreras (id, universidad_id, nombre, slug, primera_hora, duracion_min, descanso_min) VALUES
  ('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Ingeniería en Sistemas Informáticos', 'isi', '06:20', 100, 5);

-- Materias (catálogo ISI) - mismos IDs que en data/horario.json para compatibilidad
INSERT INTO materias (id, carrera_id, codigo, nombre, instructor, grupos) VALUES
  ('3b9ef975-9e15-4dde-8525-d21434660d03'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'ARC115', 'Arquitectura de computadoras', 'Ing. Boris Alexander', '[
    {"tipo":"GT","numero":1,"salon":"B11","horarios":[{"dia":"Lunes","horaInicio":"16:50","horaFin":"18:30"},{"dia":"Miércoles","horaInicio":"16:50","horaFin":"18:30"}]},
    {"tipo":"GL","numero":1,"salon":"LCOMP4","horarios":[{"dia":"Martes","horaInicio":"09:50","horaFin":"11:30"}]},
    {"tipo":"GL","numero":2,"salon":"LCOMP4","horarios":[{"dia":"Miércoles","horaInicio":"08:05","horaFin":"09:45"}]},
    {"tipo":"GL","numero":3,"salon":"LCOMP4","horarios":[{"dia":"Viernes","horaInicio":"08:05","horaFin":"09:45"}]},
    {"tipo":"GL","numero":4,"salon":"LCOMP4","horarios":[{"dia":"Viernes","horaInicio":"09:50","horaFin":"11:30"}]}
  ]'::jsonb),
  ('42f60f25-1297-4630-90a0-d0a900972e37'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'ANF115', 'Analisis Financiero', '', '[
    {"tipo":"GT","numero":1,"salon":"B11","horarios":[{"dia":"Lunes","horaInicio":"09:50","horaFin":"11:30"},{"dia":"Miércoles","horaInicio":"09:50","horaFin":"11:30"}]},
    {"tipo":"GL","numero":1,"salon":"LCOMP3","horarios":[{"dia":"Martes","horaInicio":"08:05","horaFin":"09:45"}]},
    {"tipo":"GL","numero":2,"salon":"LCOMP3","horarios":[{"dia":"Martes","horaInicio":"09:50","horaFin":"11:30"}]}
  ]'::jsonb),
  ('73117022-784d-4f03-949b-f71bb63cd00c'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'DSI215', 'Diseño de sistemas II', 'Ing Karen Peñate', '[
    {"tipo":"GT","numero":1,"salon":"C41","horarios":[{"dia":"Lunes","horaInicio":"18:35","horaFin":"20:15"},{"dia":"Miércoles","horaInicio":"18:35","horaFin":"20:15"}]},
    {"tipo":"GD","numero":1,"salon":"C41","horarios":[{"dia":"Sábado","horaInicio":"06:20","horaFin":"08:00"}]}
  ]'::jsonb),
  ('413fd2da-975e-40b7-80fd-131c0e967163'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'TOO', 'Tecnologia Orientada  Objetos', 'Oscar Alberto Diaz', '[
    {"tipo":"GT","numero":1,"salon":"C11","horarios":[{"dia":"Martes","horaInicio":"18:35","horaFin":"20:15"},{"dia":"Viernes","horaInicio":"18:35","horaFin":"20:15"}]},
    {"tipo":"GD","numero":1,"salon":"lcomp3","horarios":[{"dia":"Lunes","horaInicio":"18:35","horaFin":"20:15"}]},
    {"tipo":"GD","numero":2,"salon":"lcomp3","horarios":[{"dia":"Jueves","horaInicio":"18:35","horaFin":"20:15"}]}
  ]'::jsonb),
  ('06d9af2f-e07d-4c7c-96f2-059cad63f2fc'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'CET', 'Comercio electronico', '', '[
    {"tipo":"GT","numero":1,"salon":"c43","horarios":[{"dia":"Martes","horaInicio":"15:05","horaFin":"16:45"},{"dia":"Viernes","horaInicio":"15:05","horaFin":"16:45"}]},
    {"tipo":"GD","numero":1,"salon":"lcomp3","horarios":[{"dia":"Miércoles","horaInicio":"15:05","horaFin":"16:45"}]}
  ]'::jsonb);
