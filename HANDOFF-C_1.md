# Traspaso · sesión C_1 (Terra Analog, NASA Space Apps 2026, equipo Logos)

Fecha: 2026-11-14, noche. Repo: `logos-space-apps-2026`, rama `main`. Entrega: domingo 15-11-2026, 23:59 (hora local).
Este fichero NO está commiteado: falta que el usuario diga dónde subirlo.

## Objetivo de esta sesión
- Al principio: tareas de repo (revisar aportes del equipo, quitar la firma de Claude del historial).
- Después, por encargo de C_0: **diseño de la web**. Prioridad que fijó el usuario: **accesibilidad y que la web se explique sola** (sin nadie que la presente).
- En paralelo, sin terminar: **publicar la web en `nasa.zenidx.com`** (VPS propio + Cloudflare).

## Hecho
| Commit | Qué |
|---|---|
| (reescritura) | Se quitó `Co-Authored-By: Claude` de los 5 primeros commits y se hizo force push. Queda una rama local `backup-before-rewrite` con el historial anterior |
| `6cecc54` | `CLAUDE.md`: norma «sin firma de IA en commits ni PR» |
| `fb47606` | Accesibilidad y páginas que se explican solas: bloque «How it works» en la portada, `PageIntro` («Step N of 5» + h1 + frase) en Discover / 3D / Method, cabecera de /data, enlace «Skip to content», un único `<main>`, navegación con objetivos táctiles de 44 px, texto mínimo de 11 px y movimiento reducido |
| `f986bb6` | Portada: la escena Luna → Tierra pasa de ir ligada al scroll (3,2 pantallas) a ir por tiempo (12 s, una pantalla), con Pause/Play y Replay, y se pausa sola fuera de la vista |
| `6e148db` | Visor 3D accesible: diálogo con nombre; el foco entra, no sale con Tab y vuelve al cerrar; deslizadores con nombre limpio y `aria-valuetext`; `aria-pressed` en los botones de vista; resumen en texto de cada terreno (`role="img"`) |

Todo está explicado en `docs/bitacora.md` (entradas «noche, 7», «noche, 9» y «noche, 10»).

## Falta
1. ~~Actualizar `HowItWorks.tsx` al v3~~: hecho en `d199252`. C_0 vuelve a publicar en Pages.
2. **Publicar en `nasa.zenidx.com`**, bloqueado por el acceso SSH al VPS:
   - La clave que hay en el repo de documentación del servidor (disco externo) solo vale para `root`. Con el usuario `zenidx` da «Permission denied».
   - El acceso como `root` lo bloqueó la política de permisos de Claude Code. El usuario tiene que elegir: (A) autorizar `root`, (B) añadir la clave pública al `authorized_keys` de `zenidx` o (C) dar otro acceso.
   - Plan una vez haya acceso:
     1. Build sin `NEXT_PUBLIC_BASE_PATH`, para que la web vaya en la raíz del subdominio.
     2. Stack `nginx:alpine` copiado del de `iticbcn-hub`, con la etiqueta de Traefik `Host(\`nasa.zenidx.com\`)` y la red `proxy`.
     3. Subir `out/` al VPS y `docker compose up -d`.
     4. CNAME `nasa` al tunnel de producción en Cloudflare, con el Chrome MCP (el usuario lo autorizó). El tunnel envía todo a Traefik, así que no hay que tocar el ingress.
   - Limpieza pendiente: borrar la copia temporal de la clave SSH en el scratchpad de esta sesión.
3. **Lighthouse de accesibilidad:** no se pudo pasar (se bloqueó `npx -y lighthouse`). Se puede lanzar a mano en Chrome DevTools, pestaña Lighthouse.
4. **Limpieza final del historial** antes de la entrega: quitar las firmas de IA que han vuelto a aparecer (Claude en commits de Fer, OpenBot en commits de zexu), solo cuando todo el equipo haya subido lo suyo y esté de acuerdo, porque obliga a hacer force push.
5. Duración de la escena Luna → Tierra: está en 12 s y el usuario aún no la ha validado. Es la constante `SCENE_S` en `Story.tsx`.

## Decisiones y por qué
- **No reescribir el historial durante el hackathon:** el equipo trabaja encima y un force push obligaría a todos a hacer `reset --hard`.
- **Tamaño mínimo de letra con CSS** (`.text-\[9px\], .text-\[10px\]` → `--t-xs`) en vez de editar cada componente: así no se tocan archivos de otras sesiones, como `CandidatesTab.tsx`.
- **Las introducciones de página no repiten el título del primer capítulo** de `Story` (había duplicados como «Pick a destination.»).
- «Nobody had searched the whole planet» pasa a «We searched the whole planet»: lo primero no se puede demostrar, ver la auditoría en la bitácora.
- Escena por tiempo y no por scroll: a petición del usuario, porque se hacía pesada. Tiene pausa por WCAG 2.2.2.

## Coordinación entre sesiones (todas en la misma carpeta de trabajo)
- **C_0:** modelo de datos y puntuación en 3 fases. Suyos: `src/data/ee-global.json`, `src/data/targets.ts`, `scripts/ee/`, `CandidatesTab.tsx` y la lógica de ranking de `Story.tsx`. Publica en GitHub Pages.
- **C_2:** estrategias de base y operaciones (`docs/estrategias-bases.md`, `scripts/ops/`, `src/data/operations.json`, GeoTIFF en `data/ee/`).
- **C_1 (esta sesión):** `globals.css`, `layout.tsx`, `src/app/*/page.tsx`, `SiteNav.tsx`, `HowItWorks.tsx` y la presentación de `Story.tsx`.
- Regla: `git add` solo de los archivos propios (nunca `-A`), `git pull` antes de cada commit y sin firma de IA.

## Comandos
```bash
npm install && npm run dev          # http://localhost:3000
npx tsc --noEmit -p .               # tipos
npx eslint src                      # lint (hay un aviso que ya existía: GLOBE_TEX sin usar)
npm run deploy                      # publica lo COMMITEADO en GitHub Pages
```
No hacer `next build` en la carpeta de trabajo mientras otra sesión tenga `npm run dev` en marcha: pisa `.next`. `npm run deploy` ya construye en un worktree aparte.

## Ficheros clave
- `src/components/HowItWorks.tsx`: `HowItWorks` (portada) y `PageIntro` (cabecera de cada página).
- `src/components/Story.tsx`: `ContrastScene` (escena por tiempo, constante `SCENE_S`) y los capítulos de la historia.
- `src/components/SiteNav.tsx`: navegación y `NextPage`.
- `src/components/Viewer3D.tsx`: diálogo del visor 3D (gestión del foco, controles). `Terrain3D.tsx`: lienzo con su `aria-label`.
- `src/app/layout.tsx`: enlace «Skip to content» y `<main id="main">`.
- `src/app/globals.css`: tokens «Consola v2» (contraste AA, `--tap`, `--t-xs`) y, al final, el bloque «Accesibilidad (C_1)».
- `docs/bitacora.md`, `CLAUDE.md`.
