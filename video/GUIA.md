# Guía: rehacer el vídeo de demo (para una sesión nueva de Claude Code)

Léela entera antes de tocar nada. Contexto del proyecto en `CLAUDE.md`. Guion, planos y decisiones en `docs/guion-video.md` y `docs/normas.md` («Vídeo de demo: decisiones del equipo»).

## Qué es
- Vídeo de **29,5 s** (v6, voz `video/audio/final-voice.wav`; planos y texto en `docs/guion-video.md`), 1920×1080, 30 fps, H.264 + AAC (y copia WebM). Voz de ElevenLabs (la genera el usuario), subtítulos quemados palabra a palabra y marca de agua `SI-assisted editing · SI voice: ElevenLabs`.
- **La imagen sale de la web real que se entrega:** desde la v6, https://zenidx.github.io/logos-space-apps-2026/ (portada de misiones + `/base/`). Planos de `capture.cjs`: a (apertura → misiones), s (ficha de Haughton → permisos), b (*Plan a base* montándose), r (ensayo en la Tierra lado a lado → «Where it breaks»). Tiempos en este PC: a ≈ 4,5 min, s ≈ 2,5, b ≈ 2, r ≈ 6.
- **Dónde se publica:** página oculta https://zenidx.github.io/logos-space-apps-2026/demo-video/ de ESTE repo (MP4 directo en `/demo/terravista-demo.mp4`).

## Reglas que no se negocian (las puso el usuario)
- Menos de 30 s, siempre. Horizontal 16:9. Audio y subtítulos en inglés.
- Marca de agua con «**SI**», no «AI», y nombrando ElevenLabs.
- Nombre escrito **«Terra Vista»** (dos palabras), igual que la cabecera de la web.
- Nada de logos de NASA en lo generado, ni metraje real ni voces robóticas.
- Que la voz no prometa nada que la web no enseñe (criterio Validity). Cada plano tiene que servir a un criterio del jurado (Impact, Creativity, Validity, Relevance, Presentation).
- Subtítulos: amarillo `#FFD60A`, sin caja, contorno oscuro, Nimbus Sans negrita a 44 px, palabra a palabra acumulándose, con un «pop» suave.
- Commits directos a `main`, en inglés y **sin firma de IA**.

## Archivos
| Archivo | Qué hace |
|---|---|
| `docs/timestamps.txt` | Texto de la voz por tramos `[inicio, fin]: frase`. De aquí salen los subtítulos. |
| `video/audio/male_voice.wav` | Voz actual (v5). `voice.wav` es la femenina de la v4. `align.py`, `build.sh` y `make.sh` usan `voice.wav` salvo que se pase `VOICE=/ruta/absoluta.wav`. |
| `video/scripts/align.py` | Vosk: tiempo de cada palabra → `video/audio/word-timings.json` (se commitea, así que no hace falta Vosk si la voz no cambia). |
| `video/scripts/capture.cjs` | Graba la web fotograma a fotograma con reloj virtual → `video/build/frames/{a,b,c1,c2}`. |
| `video/scripts/overlays.cjs` | Marca de agua + degradado inferior, cierre y negro → `video/build/overlays/`. |
| `video/scripts/captions.cjs` | Subtítulos como secuencia PNG transparente → `video/build/captions/`. |
| `video/scripts/build.sh` | Monta con ffmpeg → `video/build/terravista-demo.mp4` + `.webm`. **La línea de tiempo de los planos está aquí.** |
| `video/scripts/make.sh` | Todo lo anterior en orden (salvo `align.py`). |
| `video/scripts/publish-demo.sh` | Copia el vídeo y la portada a `public/demo/`. |
| `src/app/demo-video/page.tsx` | La página oculta (`noindex`). |

## Preparación (solo si falta algo)
```bash
cd video/tools && npm ci                     # ffmpeg-static 7 (sin drawtext), ffprobe-static, playwright-core
ls /usr/bin/google-chrome                    # Playwright usa el Chrome del sistema
fc-list | grep "Nimbus Sans"                 # fuente de los subtítulos (paquete fonts-urw-base35)
```
Vosk (solo si cambia la voz). Instálalo en el directorio temporal de la sesión, nunca en el repo:
```bash
python3 -m venv $SCRATCH/vosk/venv && $SCRATCH/vosk/venv/bin/pip install vosk
# modelo: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip → descomprimir en $SCRATCH/vosk/
```

## Recetas
**Solo cambian los textos de los subtítulos o el cierre** (~1,5 min):
editar `docs/timestamps.txt` (y `overlays.cjs` si es el cierre) → `align.py` → `SKIP_CAPTURE=1 video/scripts/make.sh`.

**Voz nueva:** el usuario deja el WAV en `video/audio/`; se pasa con `VOICE=$PWD/video/audio/<archivo>.wav` a `align.py` y a `make.sh`. Los tramos de `docs/timestamps.txt` hay que recortarlos a las pausas de la voz nueva: `align.py` encaja cada palabra dentro de su tramo y los subtítulos solo salen dentro de él.

Cómo se hizo la v5 (sin volver a capturar, ~2 min):
```bash
VOICE=$PWD/video/audio/male_voice.wav $SCRATCH/vosk/venv/bin/python -I video/scripts/align.py $SCRATCH/vosk/vosk-model-small-en-us-0.15
VOICE=$PWD/video/audio/male_voice.wav SKIP_CAPTURE=1 video/scripts/make.sh terravista-demo-male
video/scripts/publish-demo.sh terravista-demo-male
```
1. Mirar la duración y las pausas: `video/tools/node_modules/ffmpeg-static/ffmpeg -i video/audio/voice.wav -af silencedetect=n=-40dB:d=0.25 -f null -`.
2. `$SCRATCH/vosk/venv/bin/python -I video/scripts/align.py $SCRATCH/vosk/vosk-model-small-en-us-0.15`. Es normal que «Terra Vista» y «spacesuit? An ice drill?» salgan «not aligned»: se reparten en el tramo que se oye.
3. Si cambia la duración, ajustar `DUR` (por defecto en `make.sh`, <30) y los cortes de plano en `build.sh` y `capture.cjs` (`path1d` del plano `a`, número de fotogramas de cada plano).
4. `SKIP_CAPTURE=1 video/scripts/make.sh` si los planos siguen cuadrando; si no, volver a capturar los que cambien.

**La web del equipo cambia y hay que volver a grabar:** `video/scripts/make.sh terravista-demo a b c1 c2`, o solo los planos afectados. Tiempos en este PC (sin GPU): **a ≈ 40 min** (escena 3D a pantalla completa, ~0,25 fps), b ≈ 2 min, c1/c2 ≈ 1 min cada uno. Lánzalo en segundo plano y avisa al usuario de cuánto tardará.

**Publicar:**
```bash
video/scripts/publish-demo.sh
git add public/demo video docs && git commit -m "Demo video: …" && git pull --rebase origin main && git push origin main
```
El push a `main` publica la web solo (GitHub Actions, `.github/workflows/deploy.yml`, ~90 s). No lances además `npm run deploy`: los dos hacen push forzado a `gh-pages`. Comprobar que el tamaño del MP4 publicado coincide con el local:
`curl -sI https://zenidx.github.io/logos-space-apps-2026/demo/terravista-demo.mp4?x=1 | grep -i content-length`.
Añadir entrada en `docs/bitacora.md` y, si cambian planos o texto, actualizar `docs/guion-video.md`.

## Antes de dar el vídeo por bueno
- `ffprobe`: 1920×1080, h264 + aac, duración < 30.
- Hoja de contactos (ver abajo). Hay que comprobar:
  - que la escena 3D no sale negra;
  - que los textos de la web están ya visibles (no a medio fundido);
  - que nada importante queda bajo los subtítulos (centro en y=905, franja ~785–1025);
  - la marca de agua;
  - el cierre.
- Enseñar al usuario el **WebM** (este PC no tiene decodificador H.264) antes de publicar, salvo que diga que publique directamente.

```bash
video/tools/node_modules/ffmpeg-static/ffmpeg -loglevel error -y -i video/build/terravista-demo.mp4 \
  -vf "select='not(mod(n\,75))',scale=480:-1,tile=4x3" -frames:v 1 $SCRATCH/sheet.jpg
```

## Trampas ya resueltas (no las repitas)
- **Páginas de `/base/` (v6):** se cargan con el reloj parado (`frozenLoad`) para que el montaje no empiece antes de grabar. El fundido de entrada de `src/app/template.tsx` (framer-motion) se queda en opacidad 0 con el reloj pausado: `frozenLoad` fuerza su estado final. El diálogo de ensayo no hace scroll porque cabe justo: se le añade relleno abajo para subir «Where it breaks» por encima de los subtítulos.
- **Alineación:** si Vosk entiende mal un nombre al principio de una frase («terrible discourse» por «Terra Vista scores»), las palabras pueden quedar antes de lo que se dicen; se fijan a mano en `word-timings.json` al inicio de la voz medido con silencedetect.
- **El PC del evento tiene 7,6 GB de RAM.** Se colgó con un ffmpeg de 64 entradas. Por eso los subtítulos van como UNA secuencia PNG. No montes con decenas de entradas.
- **WebGL por software (SwiftShader):** en la carga hay que avanzar poco el reloj (`__pump`, `__pumpSkip`), o se acumulan fotogramas y la primera captura tarda minutos. Hay una captura de calentamiento con un timeout largo.
- **Las animaciones CSS no siguen `requestAnimationFrame`.** `__syncCss` las pausa y les fija el tiempo desde el reloj virtual. Las que ya habían terminado se quedan terminadas.
- **Cosas de la web del equipo:**
  - `?capture=1` mantiene el búfer de WebGL.
  - La frase de la portada y el «Scroll» se ocultan porque caen bajo los subtítulos.
  - La caja «Access complexity» está al final de la ficha: se añade relleno abajo para poder subirla.
  - La barra de pestañas es pegajosa y tapa lo que quede justo debajo.
  - `[data-site="<id>"]` abre un sitio.
  - Enlaces directos: `?m=<misión>&s=<sitio>`.
- **`playwright recordVideo` no sirve** (le falta su ffmpeg y la calidad es baja). La salida es capturas JPEG con reloj virtual.
- **La red del evento falla con algunos certificados** (spaceappschallenge.org). No uses `curl -k`.
