# Preguntas difíciles del jurado (y cómo responder)

Preparación del pitch, 15-11-2026. Las respuestas van **en inglés**, listas para decir en voz alta (30–40 s cada una). Debajo de cada una, en español, la **trampa**: qué no hay que decir o en qué se puede pillar al equipo.

Todo sale de la web actual (portada de misiones + «Plan a base») y de `docs/logos/method.md`, `docs/logos/missions.md`, `docs/sitios-base.md` y `docs/estrategias-bases.md`.

> ⚠ **`docs/pitch.md` está desactualizado**: describe el prototipo anterior (Shackleton, Ellesmere, 25 análogos, pestaña «Candidatos»), que ahora está en `/appendix/`. No uséis sus cifras. Las que valen son las de esta hoja.

## Cifras que hay que saber de memoria
- **4 misiones**, cada una basada en campañas reales: M1 EVA con traje en terreno volcánico (objetivo: Mons Mouton, polo sur lunar) · M2 rover en arena (cráter Jezero, Marte) · M3 hielo en el suelo (Arcadia Planitia, Marte) · M4 Sol bajo y energía solar (Mons Mouton). **M4 está calculada, no validada.**
- **Celdas de 0,1° (~11 km)**, toda la tierra firme; datos de **2024** (MODIS NDVI y albedo, MODIS temperatura, GPM IMERG lluvia, SoilGrids arena, GLiM rocas volcánicas).
- **Índice = 0,5·F + 0,5·(1 − D)**. F: fracción de condiciones cumplidas. D: distancia (en percentiles terrestres) a la mediana de los análogos conocidos de esa misión.
- **Validación:** M1 3 de 4 análogos conocidos en el 2 % superior; M2 3 de 3 en el 2,1 %; M3 2 de 2 en el 1 %. Control negativo (Amazonia central): percentil 31, 1,5 y 2,8.
- **19 regiones nuevas** (5 · 6 · 4 · 4). Todas con índice ≥ 0,98: **no se ordenan entre sí por el índice**.
- **Filtro de terreno** de cada región: pendiente media ≤ 10°, ≤ 10 % nieve/hielo, ≤ 20 % agua, ≥ 800 km entre regiones, ≥ 300 km de cualquier análogo conocido.
- **«Plan a base»:** 105 puntos del polo sur lunar (84–89,5°S) y 82 de Marte en regiones con hielo publicado; relieve real de NASA Trek (LOLA 30 m / 5 m, MOLA–HRSC); el parecido del relieve con la Tierra = 70 % reparto de pendientes + 30 % relieve, en ventanas de 11 × 11 km.

---

## A. Método y validez (Validity)

### 1. «Your known analogs set the median you compare against. Isn't the validation circular?»
Cómo puede llegar: *"How do you know your index works?"* · *"Did you just tune it until it found the places you already knew?"* · *"3 of 4 in the top 2 % — impressive. But is that a fair test?"* (invita a presumir: no piquéis).

> "Partly, yes — and we say it on the page. Half of the index measures how close a place is to the median of the known training sites, so their high rank is partly built in.
> That's why we don't rely on it alone. We use a negative control: central Amazonia, which shares nothing with these sites, falls to the 31st percentile or lower in all three validated missions. And the result isn't perfect: Kīlauea Iki only reaches the 86th percentile, because its 11-kilometre cell is mostly rainforest. A tuned score would have put it on top.
> So our claim is narrow: the index reproduces where agencies actually trained, and it points to new places with the same surface conditions, at least 300 km away from any known site, each checked against the literature."

Corta: *"Partly, yes. Half the score uses the known sites, so we added a negative control — Amazonia drops to the 31st percentile or lower — and we only claim that it reproduces where agencies actually trained."*

Repreguntas:
- *"What would a proper test look like?"* → *"Leave-one-out: remove one known site, rebuild the median from the others, and see if it still ranks high. That's the first thing we'd run next."* (**No está hecho**: no digáis que sí.)
- *"Why only 2 to 4 known sites?"* → *"That's how many places hosted a documented campaign for that exact task, with an official source. Mission 4 has none, so it's labelled 'computed, not validated'."*
- *"Then how do you know the new regions are good?"* → *"We don't, until someone goes there. Each shows an evidence level from an independent literature check; it's a shortlist to verify."*

*Trampa:* no digáis «it's not circular» ni «we validated the method»; decid «it finds the places agencies already chose». No uséis «nobody has used these places» (no se puede demostrar): «as far as we found». La fuerza no está en «3 de 4 en el top 2 %» (eso es lo circular), sino en el control y en Kīlauea Iki. F es independiente solo en parte: sus rangos se fijaron conociendo los sitios.

### 2. «Why do all your new regions score 0.98 or more? How do you rank them?»
> We don't rank them by the index, and the page says so. They come from the very top of Earth's ranking, so differences in the third decimal mean nothing. We read them as a shortlist. To compare them we use the site view: the 3D terrain against the target, the Sun through the year, how far the nearest city is and how complex access is. And we sort them by independent evidence, like a literature check of each region.

*Trampa:* no defendáis que la región n.º 1 es «la mejor».

### 3. «The Moon has no air, no water, one-sixth gravity. How can any place on Earth be an analog?»
> No place on Earth is an analog of the Moon in general, and that's our starting point: a site is an analog for a task. Arizona's lava fields are good for practising suited geology traverses, not for testing radiation or gravity. For every site we list where the analogy breaks: gravity, vacuum, radiation, plus what the data can't see. The question we answer is "where on Earth can you rehearse this specific task".

### 4. «Why 11 km cells? A crater or an outcrop is much smaller.»
> 0.1° is the finest resolution at which all the global layers exist together for the whole planet with 2024 data. It's a screening tool: it tells a field team where to look. Then the site view zooms into 11 × 11 km of real elevation at 30 m. Choosing the exact spot still needs high-resolution imagery and a field check, and the page says that too.

### 5. «Mission 4 says "not validated". Why show it?»
> Because it's the most honest example of the gap we want to show. No campaign has rehearsed low-Sun work under a real low Sun: NASA's JETT tests in Arizona did it at night with artificial lights, because the noon Sun there never drops below about 31°. Our M4 regions in the Arctic and Iceland have months with the noon Sun between 0 and 12°, like the lunar pole. There is no real campaign to validate it against, so we label it "computed, not validated" instead of pretending.

### 6. «Who chose the ranges, tolerances and the 50/50 mix? Isn't that arbitrary?»
> They're team choices, and they're all written down in the method sheet with the reason for each. The ranges come from the target where the quantity is comparable (no vegetation, dark basaltic ground) and from what the task needs (loose sand for rover sinkage). Tolerances turn hard cut-offs into gradual bands. Anyone can change them and rerun: the scripts and the data are open.

*Trampa:* no digáis que salen de un estudio de sensibilidad; no se ha hecho.

### 7. «Your Moon and Mars values: where do they come from?»
> From published products: TES albedo for Jezero and Arcadia, the Mars Climate Database model for Arcadia's temperature, and LOLA for Mons Mouton. Mons Mouton's albedo is an estimate converted from LOLA's 1064-nanometre reflectance. Each value shows its source in the app. Getting them straight from the PDS products is one of our next steps.

### 8. «Mission 3 is about ground ice. You don't measure ice.»
> Right: we infer it from a mean surface temperature below −5 °C, which is a permafrost proxy, plus dry, bare ground that isn't a glacier. We check the two places where ice drilling was actually rehearsed, Haughton and the Dry Valleys, and both rank in Earth's top 1 %. But it can't confirm ice in the ground. That's written as a limit, and a permafrost map is the obvious next layer.

### 9. «Your sand data (SoilGrids) is a model with huge uncertainty.»
> Yes. At these sites its 90 % interval spans roughly 5 to 95 % sand, and we show that warning next to the value. That's also why every new region sits near 54 % sand: it's the median of the known rover test sites. It's good enough to rule places out, not to promise dunes. That's what the site view and the field check are for.

### 10. «Mons Mouton: wasn't Artemis III changed?»
> Mons Mouton was among the lunar south-pole regions NASA listed as Artemis III landing candidates in 2024. NASA now describes Artemis III differently, with landings from Artemis IV, and the south-pole regions remain the targets. We use Mons Mouton because it's a real, named south-pole site with published data.

*Trampa:* no digáis «Artemis III will land at Mons Mouton».

---

## B. Novedad y creatividad (Creativity)

### 11. «There are lots of analog maps already. What's new here?»
> Most analog work picks sites one by one, from experience, and compares them with "the Moon" in general. We start from the mission: four tasks that agencies have actually rehearsed in the field. We turn each one into measurable conditions, score every land cell on Earth, check that the score finds the real campaign sites, and then show new places plus where each one stops being useful. "Plan a base" then goes the other way: pick any site on the Moon or Mars, see the base laid out on real NASA terrain, and get the place on Earth to rehearse each job.

### 12. «Can you prove nobody has used your new regions?»
> No, and we don't claim that. We exclude everything within 300 km of the known analog sites we found, and we ran an independent literature check of every new region. The app shows what it found as an evidence level. Two regions were removed by hand after that check, for example Tankwa Karoo, because it turned out to be shale, not volcanic rock.

---

## C. Impacto y relevancia (Impact / Relevance)

### 13. «Who would actually use this?»
> Field-test planners at agencies and universities, and rover or suit teams, when they choose where to test. Every analog campaign costs a lot of money and logistics. Our tool gives them a first-pass shortlist with its limits, for example "remote, needs a research permit, no basalt at the exact spot", before anyone flies out. It's a screening tool, not a site recommendation, and the page says that.

### 14. «Why do you show "access complexity"? Isn't rating countries political?»
> It's not a rating of any country, and the page says so. It estimates how much coordination an external field team may need: World Bank governance data, conflict events within 200 km and official travel advice, combined with weights we chose. It also flags special permits, like research licences in Nunavut. Remoteness can even be the point: some analog missions rehearse isolation.

### 15. «Is it relevant to the challenge? It asks for permanent base locations.»
> The challenge asks for Earth locations that are analogs of the permanent Moon base sites and of Mars, plus what is similar, how much, and where the analogy breaks. The four missions answer that for real targets. "Plan a base" answers it for the base itself: choose a site at the lunar south pole or on Mars and you get the Earth place with the most alike ground, and where to rehearse each job of the base.

---

## D. «Plan a base»

### 16. «Is that base layout a NASA design?»
> No, it's a concept, and the page says so. Each part is placed with simple rules on real NASA elevation data: landing pad at a set distance from the habitat, reactor away from it, rover slopes under 20°, buildable ground under 10°. Sunlight and temperature come from the relief itself. Ice on the Moon is placed only where the ground stays below 110 K, the temperature at which water ice can last. The distances and how often each job repeats are our assumptions.

### 17. «Why does each job go to a different place on Earth?»
> Because each rehearsal needs its own conditions: dust work needs a dry, dusty place, ice drilling needs frozen ground, power tests need a low Sun. With our data one Earth site rarely covers more than one job of the base well. So we give two answers: the place with the most alike ground overall, and the best place for each job. You don't rehearse a whole base in one place.

### 18. «How do you measure that the terrain is "alike"?»
> We compare 11 × 11 km windows on the same grid: 70 % is how the slopes are spread (flat, gentle, steep…), 30 % is the total relief. It's computed live in the browser from NASA Trek data for the Moon or Mars, and from open elevation tiles for Earth. It compares the shape of the ground, not the rock or the colour.

---

## E. Datos, IA y proceso

### 19. «Which NASA data did you use?»
> MODIS vegetation, albedo and surface temperature, GPM IMERG precipitation, NASA Trek for the Moon and Mars (LRO LOLA elevation, LRO WAC imagery, Viking and MOLA–HRSC for Mars), Blue and Black Marble imagery, and NASA POWER climatology for sunlight and temperature through the year. Partner data: ESA Copernicus DEM and WorldCover, SoilGrids, and the GLiM rock map. The full list with licences is in Method & sources.

### 20. «How did you use AI? The rules forbid using it for the idea.»
> The idea and the approach are ours: start from real field campaigns, score each task, and show where the analogy breaks. We used an AI coding assistant, Claude Code, as a tool to write code, process data and draft texts. Every decision was ours. There's a file-by-file log of what the AI did in the repository, linked from the footer.

*Trampa:* sed coherentes con `AI_USAGE.md` y con el pie de la web. No minimicéis («just a little»): el registro dice cuánto se usó.

### 21. «What would you do with three more months?»
> Three things. First, replace our Moon and Mars estimates with values straight from PDS products. Second, add the layers we're missing: a permafrost map for ice, emissivity for real rock type (ASTER on Earth, Diviner on the Moon, TES on Mars), and terrain shading for the low Sun. Third, the real test: show the shortlist to a field-campaign team and check one region on the ground.

---

## F. Si algo falla en directo
- **La web 3D no carga o va lenta:** tened el **vídeo de 30 s** abierto (https://zenidx.github.io/logos-space-apps-2026/demo-video/) y capturas de la ficha de un sitio.
- **«Plan a base» dice «Trek 500»:** el servidor de relieve de NASA a veces falla. Decid «that's NASA's Trek elevation service timing out, it's live data» y recargad, o enseñad Jezero (Marte), que cargó bien en las pruebas.
- **Pregunta que no sabéis:** «Good question — we didn't measure that. Our data can't tell, and it's on our limits list.» Mejor reconocerlo que inventar una cifra.
