# Despliegue (Fase 4)

Sigue estos pasos después de tener Supabase configurado (esquema, RLS y seed ejecutados) y la app funcionando en local.

## 1. Repositorio remoto

1. Crea un repositorio en GitHub (o GitLab).
2. En la raíz del proyecto:

   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git add .
   git commit -m "Migración a Supabase y preparación para Vercel"
   git push -u origin main
   ```

   Si aún no has hecho el primer commit:

   ```bash
   git config user.email "tu@correo.com"
   git config user.name "Tu Nombre"
   git add .
   git commit -m "Estado inicial con Supabase"
   git push -u origin main
   ```

## 2. Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (recomendable con GitHub).
2. **Add New Project** → Importa el repositorio de la app.
3. Framework: Next.js (se detecta solo).
4. **Environment Variables** – Añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = la URL de tu proyecto Supabase (Project Settings → API).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clave **anon public** del mismo proyecto.
5. Deploy. Cuando termine, tendrás una URL de producción (ej. `https://tu-app.vercel.app`).

## 3. Supabase (redirect URLs)

Para que el login redirija bien desde producción:

1. En el proyecto de Supabase: **Authentication** → **URL Configuration**.
2. **Site URL**: pon la URL de tu app en Vercel (ej. `https://tu-app.vercel.app`).
3. **Redirect URLs**: añade la misma URL (y si usas previews, `https://*.vercel.app`).

Guarda los cambios.

## 4. Usuarios anónimos (opcional)

Para que "Continuar sin cuenta" funcione:

1. En Supabase: **Authentication** → **Providers**.
2. Activa **Anonymous Sign-Ins**.

Con esto la migración y el despliegue quedan listos.
