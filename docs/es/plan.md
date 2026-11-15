# Plan (14–15 nov 2026). Entrega: **domingo 15-11 a las 16:00**; todo terminado a las **15:00**; se congela a las **13:00**

Actualizado el 15-11 a la 01:40. Cambio de zexu (14-11, ~21:30): la entrega se adelantó de las 23:59 a las 16:00.

## Decisiones vigentes de zexu
- Idea propia del equipo: análogos **por misión** + «access complexity» neutral. La IA es herramienta y se declara.
- Escena: sistema real con el Sol (vista general heliocéntrica) y primer plano de la Tierra con el mundo objetivo al lado. La «órbita compartida» se descartó por falsa.
- Sitios en la Tierra (00:43): **opción B, «líneas a etiquetas»**: línea discontinua y semitransparente de cada sitio visible a su nombre, fuera del globo; **sin línea al mundo objetivo**; sitio elegido más brillante y con pulso; en móvil, solo el elegido y los 2–3 primeros.
- Interfaz radial (índice en el centro, un anillo por condición).
- 4 misiones: EVA en terreno volcánico, rover en arena, agua de hielo del suelo y **«Low-Sun operations and solar power»** (calculada, **no validada**). La 5.ª (construir con suelo local) queda sin puntuar, en «Next missions».
- 4 añadidos (00:43): filtros de logística, selector Flat / Steep / Any, niveles de evidencia como insignia y orden, línea «Hardware rehearsed». Extra si a las 10:00 todo está estable: deslizadores «Your priorities».
- No hacer: llamar «fit %» o «fidelity» al índice, pesos sin fuente, misiones sin campaña real. Lo reutilizado de otro proyecto, citado en References.
- Publicar: push a `main` sin pedir permiso hasta las 13:00 si pasan tsc, lint, pruebas y build, y se comprueba en local y en vivo. Desde las 13:00, solo con OK de zexu.

## Horario del domingo
| Hora | Quién | Qué |
|---|---|---|
| 01:28 (hecho) | Líder | En vivo: etiquetas B, misión 4, datos v8, comprobación independiente de 9 regiones más (commit `1300144`) |
| 01:45 | Líder | En vivo: niveles de evidencia (insignia y orden), filtros de logística y terreno, «Hardware rehearsed», gráfico de energía solar por mes |
| 02:00–04:00 | Logos Tester · Logos Legal · Crítico | 2.ª prueba a ciegas; licencias de las fuentes nuevas; revisión como jurado |
| 04:00–09:00 | Líder | Arreglos de las revisiones; medidas baratas de rendimiento; textos |
| 09:00 | Líder | Medir fps y Lighthouse con la máquina libre; si un móvil real va mal, vista general estática |
| 10:00 | Líder | Solo si todo está estable: deslizadores «Your priorities» |
| 11:00–12:00 | Líder | Capturas y textos de la página en `docs/submission/` (campos de Legal en su checklist) |
| 12:00–13:00 | Líder | Congelar; solo arreglos críticos |
| 13:00–15:00 | zexu y equipo | Vídeo ≤ 30 s y página del proyecto |
| 15:00–16:00 | zexu | Margen y envío |

## Pendiente de zexu
- Confirmar que el equipo ha revisado lo generado con IA (las cabeceras dicen «reviewed by team Logos»; `docs/method.md` dice «to be reviewed»).
- Confirmar el texto de la declaración de IA (README y «Method & sources»).
- Abrir la web en un móvil real.
- Vetar o aceptar: la región del Karoo (Sudáfrica) se retiró de la misión 1 porque la fuente geológica contradice que sea volcánica.
- Aceptar o no los niveles de Lighthouse y no subir a Next 16.
