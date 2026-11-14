# Logos Legal · Informe 2: licencias de `datos/geopolitica.md` (14-11-2026)

Solo lectura. No es asesoría legal. Reviso las fuentes de `Shared/logos/datos/geopolitica.md`. «Verificado» quiere decir que hoy he releído la cita en la URL oficial.

## Decisiones
1. **WDPA / Protected Planet → SÍ, con condiciones.** Hoy he leído en https://www.protectedplanet.net/en/legal que se puede publicar en línea si «the WDPCA and GD-PAME Data are not downloadable» y la atribución está a la vista. «Commercial Use» solo es (a) uso por o para una entidad con ánimo de lucro, o (b) uso «for the purposes of revenue generation». Un proyecto de hackathon sin ingresos no entra en ninguno de los dos.
   Condiciones:
   - En la web solo va un **flag por sitio** (`PROTECTED_AREA: yes/no`). Sin polígonos, sin nombres ni IDs de WDPA y sin servicio de descarga.
   - Atribución visible junto al flag: `UNEP-WCMC and IUCN (2026), Protected Planet: The World Database on Protected and Conserved Areas (WDPCA) [On-line], [Month/2026], Cambridge, UK: UNEP-WCMC and IUCN. Available at: www.protectedplanet.net.`, con el mes y el año de la versión descargada y un enlace a protectedplanet.net.
   - Usar la versión más reciente.
   - El flag queda **fuera de la licencia abierta del repo**. Añadir en `LICENSE`/README: «Protected-area flags derived from WDPCA are not covered by this licence; see protectedplanet.net terms.»
   - **Riesgo a vigilar:** si el pitch o `valor-anadido.md` presentan el proyecto como negocio (modelo de ingresos, ROI, clientes), se acerca a «revenue generation». En ese caso hay que quitar el flag WDPA o cambiarlo por OSM.
   - Las «two free copies» que piden: recomendable mandar el enlace por correo a UNEP-WCMC después de la entrega (no bloquea; lo haría zexu).
   - **Alternativa sin dudas:** OSM `boundary=protected_area` (ODbL). Obliga a publicar el JSON derivado bajo ODbL y a citar «© OpenStreetMap contributors».
2. **ACLED → FUERA. Confirmado.** EULA (https://acleddata.com/eula, verificado): solo «non-commercial purposes»; no basta con que el contenido esté «made available through the Licensee's own dashboard»; los derivados tienen que ser «transformative». Una web pública con datos por sitio no lo cumple. No usarlo ni en agregado. UCDP GED cubre la misma necesidad con CC BY 4.0.

## Licencias, una por una
| Fuente | Licencia | ¿Verificado hoy? | Crédito exacto | Veredicto |
|---|---|---|---|---|
| WGI `pv` 2026 | CC BY 4.0 (solo en el Data Catalog) | No releído; cita de Datos | `World Bank, Worldwide Governance Indicators, 2026 update (2025 data), www.govindicators.org, CC BY 4.0` + la frase «perceptions-based and inherently subjective» | OK. Basta con el Data Catalog: es el catálogo oficial de datos del Banco Mundial |
| UCDP GED 26.1 + Candidate | CC BY 4.0 | **Sí**: «licensed under CC BY 4.0 — you are free to use and redistribute them provided you cite the relevant publications» | `UCDP Georeferenced Event Dataset (GED) Global version 26.1, Uppsala Conflict Data Program, CC BY 4.0` + las citas de Datos (Davies, Pettersson & Öberg 2026; Sundberg & Melander 2013; Hegre et al. 2020 para Candidate) | OK |
| Avisos de viaje de EE. UU. (cadataapi) | Dominio público, 17 U.S.C. §105 | Parcial (la página de copyright da 403) | `Source: U.S. Department of State, travel.state.gov (retrieved YYYY-MM-DD)` | OK. Solo se usa el **nivel** y la fecha, no el texto del resumen, así que el riesgo de contenido de terceros es casi nulo |
| FCDO travel advice | OGL v3.0 | No releído | `Contains public sector information licensed under the Open Government Licence v3.0.` + enlace a gov.uk/foreign-travel-advice | OK. Sin escudos ni logos de GOV.UK |
| Natural Earth Admin-0 v5.1.1 | Dominio público | No (la página no cargó); cita de Datos | `Made with Natural Earth` (cortesía) | OK |
| AADC ASPA 2024 | CC BY 4.0 | **Sí** (ficha de researchdata.edu.au) | `Terauds, A., Wauchope, H.S., Wen, W. and Lee, J.R. (2024) Antarctic Specially Protected Areas (points and polygons) 2024 update, Australian Antarctic Data Centre, CC BY 4.0` | OK |
| Shapefile ASPA/ASMA de la ATS | Desconocida («Copyright © ATS») | — | — | **No usar** el shapefile. Citar el texto del Tratado sí se puede |
| Oxford MAP Accessibility 2015 | CC BY 4.0 | **Sí** (catálogo de Earth Engine) | `Weiss, D.J. et al. (2018) A global map of travel time to cities to assess inequalities in accessibility in 2015. Nature 553, 333–336. doi:10.1038/nature25181. CC BY 4.0` | OK. Cambiar el ID deprecated por `projects/malariaatlasproject/...` |
| ACLED | EULA no comercial | **Sí** | — | **Fuera** |
| WDPCA | Términos propios | **Sí** | Ver decisión 1 | Solo el flag, con condiciones |

## ¿Es neutral el texto de «access complexity»?
En general sí: la definición en inglés, el aviso «Not travel advice», no ordenar países, la escala de un solo tono y el tratamiento de la Antártida y las zonas en disputa están bien. Cinco ajustes:
1. **Nombre del componente G:** «Country-level stability perception» → `Governance perception (WGI Political Stability, perceptions-based)`. Así se ve que es una percepción que miden otros, no algo que digamos nosotros.
2. **Componente A:** los avisos de **dos gobiernos (US y UK)** reflejan su punto de vista. Añadir: «Travel advice from two governments (US, UK); other governments may assess differently.»
3. **Fronteras:** en los créditos y en el mapa, «Boundaries are de facto (Natural Earth) and imply no position on sovereignty.»
4. **No copiar el texto de los avisos** (p. ej. «Do Not Travel») como etiqueta del sitio. Mostrar el nivel con su fuente y fecha («US advisory: Level 4 (2026-10-22)»).
5. **Pesos:** decir en la interfaz que son una «design choice by team Logos, adjustable», como ya pide el documento.
- También: evitar «insufficient data» con un tono que suene negativo hacia el país; mejor «not computed (missing sources)».

## Pendiente
- `suelo-espectral.md`: todavía no ha llegado.
- No he podido releer hoy WGI, FCDO ni Natural Earth (su página no cargó). Me fío de las citas de Logos Datos, y las tres son licencias conocidas y abiertas.
