# Umbral

Red que orquesta a las partes de un proyecto de estructuración inmobiliaria. El estructurador
crea un proyecto, define sus hitos y decide qué rol se habilita en cada uno; inversores,
entidades financieras y el resto de actores entran cuando les toca, ven solo lo que corresponde
a su rol y suben de nivel por autorización explícita — nunca por defecto.

Es la app hermana de **Off Market** (mismo grupo): comparte el motor de confidencialidad —
autenticación, sesiones, solicitud de acceso, revelación progresiva, log de auditoría — pero
orquesta un proyecto con muchas partes en vez de una ficha con un comprador.

## Cómo funciona

1. **El estructurador crea el proyecto** con una plantilla de tres hitos: Viabilidad → Equity →
   Financiación. Cada hito habilita un rol (Inversor en Equity, Entidad financiera en
   Financiación).
2. **Invita a cada parte** cuando el hito que la habilita ya está en curso — no antes.
3. **NDA dentro de la plataforma.** El invitado ve el resumen anónimo del proyecto y acepta el
   acuerdo de confidencialidad antes de ver nada más.
4. **Revelación por niveles, propia de cada rol.** El inversor y la entidad financiera tienen su
   propia escala (en el MVP, dos niveles cada uno). Subir de nivel es una solicitud explícita que
   el estructurador aprueba o rechaza.
5. **Todo queda en un log de auditoría** visible para el estructurador: quién fue invitado, quién
   aceptó el NDA, quién pidió qué nivel y quién lo aprobó.

## Alcance de este MVP

Deliberadamente acotado para demostrar el mecanismo sin construir la plataforma entera de golpe:

- Un solo estructurador por proyecto (sin multi-tenant todavía).
- Dos roles activos: **Inversor** y **Entidad financiera**. Constructora, notaría y propietario
  del suelo quedan fuera — el modelo de datos ya tiene sitio para ellos (`ProjectRoleType`,
  `MilestoneKey`).
- Invitación directa por email a alguien que ya tiene cuenta — sin invitación a quien no la tiene
  todavía, ni directorio ni descubrimiento anónimo.
- Verificación de identidad **autodeclarada** (sin integrar un proveedor real como Stripe
  Identity, a diferencia de Off Market).
- Sin gestión de documentos todavía (`ProjectDocument` existe en el modelo, pero no hay UI para
  subirlos ni para servirlos de forma auditada).

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS
- **PostgreSQL** vía **Prisma 7** (driver adapters: `@prisma/adapter-pg`)
- Autenticación propia con sesiones en base de datos (cookie httpOnly) y contraseñas con `scrypt`

## Primeros pasos en local

### 1. Base de datos

Con Docker disponible:

```bash
docker compose up -d
```

Sin Docker, usando un PostgreSQL local ya instalado:

```bash
sudo -u postgres psql -c "CREATE ROLE umbral LOGIN PASSWORD 'umbral';"
sudo -u postgres psql -c "CREATE DATABASE umbral OWNER umbral;"
sudo -u postgres psql -c "ALTER ROLE umbral CREATEDB;" # necesario para la shadow DB de Prisma en dev
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

### 3. Dependencias, migraciones y datos de ejemplo

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

El seed crea (contraseña `umbral1234` para todas):

- `estructurador@umbral.demo` — el estructurador, dueño del proyecto demo `UMB-DEMO-01`
- `inversor@umbral.demo` — inversor ya activo en el proyecto, con nivel 1 concedido
- `banco@umbral.demo` — cuenta de entidad financiera, sin participación todavía (su hito,
  Financiación, aún no está activo)

### 4. Arrancar la app

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura relevante

```
prisma/schema.prisma                 Modelo de datos (proyectos, hitos, roles, participaciones, auditoría)
prisma/seed.ts                        Datos de ejemplo
src/lib/auth.ts                       Sesiones y control de acceso por rol global
src/lib/disclosure.ts                 Reglas de qué nivel ve cada participación y cuándo un rol está abierto
src/lib/actions/*.ts                  Server Actions: auth, proyectos, invitaciones, solicitudes de nivel
src/app/dashboard/projects            Panel del estructurador: hitos, invitaciones, solicitudes, auditoría
src/app/dashboard/participations      Panel del participante: sus proyectos
src/app/participations/[id]           Vista del participante en un proyecto (NDA, nivel, solicitar más)
```

## Qué falta para ampliar el alcance

- Constructora, notaría y propietario del suelo como roles activos (el modelo ya los admite).
- Invitación a alguien sin cuenta todavía (token de invitación que crea la cuenta al aceptar).
- Gestión real de documentos por nivel, con descarga auditada.
- Verificación de identidad real (Stripe Identity, como en Off Market).
- Directorio y descubrimiento anónimo de proyectos, cuando tenga sentido abrir la red más allá de
  invitación directa.
- Tests automatizados.
