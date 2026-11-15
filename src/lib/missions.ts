// AI-assisted (Claude), reviewed by team Logos
// Mission model. Data: src/data/sites.json (data v7; method v3 in docs/method.md).
// Each mission comes from real analog field campaigns; each Earth site has a 0–1 analog index built from per-condition
// similarities (validated missions: 0.5 · conditions met + 0.5 · closeness to known analogs; mission 4, which has no campaign
// site to validate against: the plain mean of the similarities), plus where the analogy breaks, access complexity,
// travel time, mean slope and the level of independent evidence.
import raw from "@/data/sites.json";
import details from "@/data/site-details.json";
import terrain from "@/data/terrain-index.json";
import type { GlobeBody } from "@/lib/globe-tex";

export type MissionId = "m1-eva-basalt" | "m2-rover-sand" | "m3-ground-ice" | "m4-low-sun";

interface RawValue { value: number | null; unit?: string; source?: string; url?: string | null }
interface RawVar { id: string; label: string; unit: string; why: string; inMatch: boolean; ideal?: string; tolerance?: number; coverageWeight?: number; value?: null }
interface RawPV { value: number | null; similarity: number | null; source: string; inMatch?: boolean }
interface RawAccess { level: "low" | "medium" | "high" | null; score: number | null; floor?: string | null; permitFlag?: string; permitNote?: string | null; permitUrl?: string | null; basis?: string; note?: string; sources?: string[] }
interface RawSite { region?: { cells: number; areaKm2: number } | null; id: string; name: string; country: string | null; lat: number; lon: number; kind: "known" | "new"; match: number | null; matchPercentile?: number | null; perVariable: Record<string, RawPV | null>; breaks: string[]; accessRisk: RawAccess | null; campaign?: string }
interface RawMission {
  id: MissionId; title: string; campaigns: { name: string; url: string }[];
  target: { body: GlobeBody; name: string; lat: number; lon: number; coordSource: string; description?: string; descriptionSources?: { name: string; url: string }[]; values: Record<string, RawValue> };
  variables: RawVar[]; breaks?: { text: string; source: string; url: string | null }[]; sites: RawSite[];
  validation: { method: string; result: string; validated?: boolean; landCells?: number; control?: { match: number; matchPercentile: number } };
}
const data = raw as unknown as { generatedAt: string; version: string; missions: RawMission[] };
const HOW = (details as unknown as { items: Record<string, { how?: { travelTimeToCityHours?: number | null } }> }).items;
const TERRAIN = (terrain as unknown as { items: Record<string, { stats: { slopeMeanDeg: number } }> }).items;

export interface Variable { id: string; label: string; unit: string; why: string; inMatch: boolean; ideal: string | null; tolerance: number | null }
export interface PerVar { id: string; label: string; unit: string; value: number | null; similarity: number | null; source: string; inMatch: boolean }
export interface Access { level: "Low" | "Medium" | "High" | "Not assessed"; score: number | null; basis: string; sources: string[]; note: string; permit: string | null; permitUrl: string | null; permitChecked: boolean }
/** Independent evidence that the place suits the task: a campaign ran there, or what a literature check found near a new region. */
export type Evidence = "agency" | "nearby" | "partial" | "none" | "unchecked";
export interface Site {
  rank: number | null; of: number | null; areaKm2: number | null; id: string; name: string; country: string | null; lat: number; lon: number; kind: "known" | "new";
  match: number | null; percentile: number | null; vars: PerVar[]; breaks: string[]; access: Access; campaign: string | null;
  travelH: number | null;  // hours to the nearest city (Weiss et al. 2018; mean of the 0.1° cell); null where the map has no data
  slopeDeg: number | null; // mean slope of the 11 × 11 km window (115 m grid); not part of the index
  evidence: Evidence;
}
export interface Target { name: string; body: GlobeBody; lat: number; lon: number; coordSource: string; description?: string; descriptionSources?: { name: string; url: string }[]; values: Record<string, RawValue> }
export interface Mission {
  id: MissionId; short: string; title: string; blurb: string; target: Target;
  campaigns: { name: string; url: string }[]; variables: Variable[]; sites: Site[];
  validation: { method: string; result: string; controlPercentile: number | null }; validated: boolean; landCells: number | null; notScored: string[]; keyLimit: string; rehearse: string; matters: string;
  always: { text: string; source: string; url: string | null }[];
}

// Team copy for each mission (short name, one-line pitch, what Earth can never reproduce).
const COPY: Record<MissionId, { short: string; blurb: string; rehearse: string; matters: string; keyLimit: string; notScored: string[]; always: string[] }> = {
  "m1-eva-basalt": {
    short: "Suited EVA on volcanic terrain",
    blurb: "An operational analogue for suited traverses and field geology — not a match to Mons Mouton's highland rock.",
    rehearse: "Suited traverses, sampling and field geology over bare volcanic ground, as in NASA's JETT and Desert RATS tests and ESA's PANGAEA training.",
    matters: "Crews rehearse surface operations on Earth before they fly. Where a test runs decides what it can teach.",
    keyLimit: "Volcanic rock is mapped within ~80 km (0.5° geological map); basalt at the site itself is not confirmed.",
    notScored: ["Rock type at the outcrop — volcanic class comes from a 0.5° map (GLiM)", "Walkable slope — needs a 30 m elevation model"],
    always: ["Gravity: 1.62 m/s² on the Moon vs 9.80 on Earth."],
  },
  "m2-rover-sand": {
    short: "Rover on sand",
    blurb: "Loose, sandy, bare ground where rovers can get stuck — and learn not to.",
    rehearse: "Driving a rover over loose sand and dune slopes, as JPL did with its Scarecrow test rover at Dumont Dunes (2012).",
    matters: "Soft sand can stop a rover. Mobility tests on Earth help set driving limits before landing.",
    keyLimit: "Sand fraction is a soil-model estimate with a wide uncertainty; it indicates sandy soil, not dunes.",
    notScored: ["Dune slopes — needs a 30 m elevation model", "Jezero sand fraction — no comparable value yet"],
    always: ["Gravity: 3.73 m/s² on Mars vs 9.80 on Earth."],
  },
  "m3-ground-ice": {
    short: "Water from ground ice",
    blurb: "Cold, dry regions to screen for possible near-surface ice; the score does not detect ice.",
    rehearse: "Drilling through dry soil into ice-cemented ground, as NASA's TRIDENT drill did at Haughton crater (2024).",
    matters: "Ice near the surface could supply water for crews. Drills must be proven on frozen ground first.",
    keyLimit: "Ground ice is inferred from temperature and dryness; no ice was detected directly.",
    notScored: ["Ground ice itself — temperature is used as a proxy", "Arcadia ice map (NASA SWIM) — not included in this prototype"],
    always: ["Gravity: 3.73 m/s² on Mars vs 9.80 on Earth."],
  },
  "m4-low-sun": {
    short: "Low-Sun operations and solar power",
    blurb: "Bare ground where the noon Sun stays near the horizon for months, as it does all year at the lunar south pole.",
    rehearse: "Working and driving with long shadows and glare from a Sun close to the horizon, and running solar arrays at low Sun angles. NASA's JETT3 and JETT5 tests simulated this at night in Arizona, with a lighting cart and a portable spotlight.",
    matters: "At Mons Mouton the noon Sun stays about 4° to 7° above the horizon all year (computed from latitude; terrain ignored). Light decides what crews can see and where solar arrays get power.",
    keyLimit: "Computed, not validated: no field campaign has rehearsed this under a real low Sun, so there is no known site to check the index against. The Sun's height comes from latitude only.",
    notScored: ["Snow cover and cold in the low-Sun months, which are winter on Earth", "Cloud cover — the monthly clearness index is shown per site as context only", "Terrain shadows — the Sun's height is computed from latitude only"],
    always: ["Gravity: 1.62 m/s² on the Moon vs 9.80 on Earth."],
  },
};

/**
 * Hardware that real campaigns rehearsed with, per mission. Every item is quoted from an agency page or report;
 * the rows in brackets are the checks in docs/sources.md.
 */
export const HARDWARE: Record<MissionId, { text: string; by: string; url: string }[]> = {
  "m1-eva-basalt": [
    { text: "Rover operations run by NASA and JAXA at Black Point Lava Flow", by: "Desert RATS, 2022 [C3a, C3b]", url: "https://www.nasa.gov/humans-in-space/nasa-practices-rover-operations-in-simulated-lunar-environment/" },
    { text: "Science EVAs under a 5-minute one-way communication delay", by: "BASALT, 2017 [C4c]", url: "https://www.nasa.gov/general/basalt-research-program-hawaii-2017-field-deployment/" },
    { text: "A lighting cart that mimicked the low Sun of the lunar south pole on night moonwalks", by: "JETT3, 2022 [L15]", url: "https://www.nasa.gov/feature/moonwalking-test-mission-daily-field-log" },
  ],
  "m2-rover-sand": [
    { text: "Scarecrow, a test rover that weighs on Earth about what Curiosity weighs on Mars", by: "JPL, Dumont Dunes, 2012 [C6]", url: "https://www.jpl.nasa.gov/news/mojave-desert-tests-prepare-for-nasa-mars-roving/" },
    { text: "Bridget, the rover of ESA's five-day SAFER field trial", by: "ESA, Atacama, 2013 [C7]", url: "https://www.esa.int/Enabling_Support/Space_Engineering_Technology/ESA_rover_completes_exploring_Mars-like_desert" },
    { text: "KREX2 medium rover prototype with a 1 m rotary-percussive drill", by: "NASA ARADS, Atacama, 2015–2019 [C8a]", url: "https://ntrs.nasa.gov/citations/20220002136" },
  ],
  "m3-ground-ice": [
    { text: "TRIDENT drill: nearly 11 m drilled, 4 m of it into ice-cemented materials", by: "NASA, Haughton crater, 6–11 August 2024 [C10a, C10b]", url: "https://ntrs.nasa.gov/citations/20250004164" },
    { text: "RESOLVE: real-time water quantification in four days of lunar analog testing", by: "NASA, Mauna Kea, February 2010 [C12a]", url: "https://ntrs.nasa.gov/citations/20100033667" },
    { text: "IceBite, an auger and sampling system for ground ice on Mars, to be tested in University Valley, Antarctica", by: "NASA ASTEP, announced 2008 [C11b]", url: "https://astrobiology.nasa.gov/news/new-astep-projects-reach-from-arctic-to-antarctic-mars-to-europa/" },
  ],
  "m4-low-sun": [
    { text: "A lighting cart that mimicked the Sun and the lighting of the lunar south pole", by: "JETT3, 2022 [L15]", url: "https://www.nasa.gov/feature/moonwalking-test-mission-daily-field-log" },
    { text: "A portable spotlight acting as the Sun on night EVAs", by: "JETT5, 2024 [L16]", url: "https://www.usgs.gov/centers/astrogeology-science-center/news/artemis-iii-mission-tests-san-francisco-volcanic-field" },
    { text: "Regolith testbeds for navigating in low-angle lighting and harsh solar glare", by: "NASA Ames Lunar Lab [L17]", url: "https://www.nasa.gov/centers-and-facilities/ames/the-lunar-lab-and-regolith-testbeds/" },
  ],
};

/**
 * New regions removed after screening their 11 × 11 km window: mean slope above 10° (Copernicus DEM), more than 10 % snow or ice,
 * or more than 20 % water (ESA WorldCover 2021; Natural Earth glaciated areas south of 60°S). Such ground is not for a suited
 * traverse, a rover test or a drill rig, whatever the index says. One more region was removed because the independent check
 * contradicts the property the mission needs. Known analogs are kept as they are, because they are only used to validate the index.
 */
export const REMOVED: Record<string, { name: string; reason: string }> = {
  "m1-eva-basalt-new6": { name: "Departamento San Carlos, Mendoza (Argentina)", reason: "mean slope 15.3°, relief 1,974 m over 11 km" },
  "m2-rover-sand-new5": { name: "Ngari Prefecture (Tibetan Plateau)", reason: "mean slope 16.4°, relief 1,007 m over 11 km" },
  "m3-ground-ice-new4": { name: "Karakoram (disputed area)", reason: "mean slope 17.9°, relief 1,355 m over 11 km" },
  "m3-ground-ice-new3": { name: "Allaikhovsky Ulus, Sakha (Russia)", reason: "54 % of the 11 km window is water (lake-covered tundra; ESA WorldCover 2021)" },
  "m3-ground-ice-new5": { name: "Coats Land coast (Antarctica)", reason: "inside the ice sheet (Natural Earth glaciated areas) and 31 % sea" },
  "m3-ground-ice-new6": { name: "Baffin coast, Nunavut (Canada)", reason: "18 % glacier and 56 % water in the window (ESA WorldCover 2021)" },
  "m1-eva-basalt-new7": { name: "Tankwa Karoo, Western Cape (South Africa)", reason: "passes the ground screen, but the independent check contradicts it: a geological study places the Tankwa Karoo in shale, south of the line where Karoo dolerite occurs (De Kock et al. 2017, South African Journal of Science); its volcanic flag came from the coarse 0.5° rock map" },
  "m3-ground-ice-new9": { name: "Qilian Mountains, Gansu (China)", reason: "passes the screen but relief is 1,324 m over 11 km and it ranks 102nd: left out as the weakest" },
};

const LEVEL: Record<string, Access["level"]> = { low: "Low", medium: "Medium", high: "High" };
const PERMIT_NOTE = "Check national park and research permits before fieldwork.";
/** Declared floor (applied in the data pipeline, accessRisk.floor): an official travel advisory at its highest level means at least "High". */
export const advisoryAtMax = (basis: string) => /US level 4 of 4/.test(basis) || /UK advice covers whole country/.test(basis);
/** Permits we could not confirm on an official page: said as "may apply; not checked". Confirmed ones come from the data (permitNote). */
const PERMIT_UNCHECKED: Record<string, string> = {
  "m3-ground-ice-new7": "Special entry permits may apply in this Arctic border region; not checked.",
  "m4-low-sun-new3": "Special entry permits may apply in this border region; not checked.",
};
function accessOf(a: RawAccess | null, id = ""): Access {
  if (!a) return { level: "Not assessed", score: null, basis: "", sources: [], note: PERMIT_NOTE, permit: PERMIT_UNCHECKED[id] ?? null, permitUrl: null, permitChecked: false };
  const antarctic = a.permitFlag === "ANTARCTIC_TREATY_AREA";
  return {
    level: a.level ? LEVEL[a.level] : "Not assessed",
    score: a.score,
    basis: (a.basis ?? "") + (a.floor ? `. ${a.floor}` : ""),
    sources: a.sources ?? [],
    note: a.note ?? PERMIT_NOTE,
    permit: antarctic ? "Antarctic Treaty area: no country attributed; a national permit is required" : a.permitNote ?? PERMIT_UNCHECKED[id] ?? null,
    permitUrl: a.permitUrl ?? null,
    permitChecked: antarctic || !!a.permitNote,
  };
}

/**
 * Independent check of each new region against literature and agency sources (docs/independent-check.md, 2026-11-15).
 * No source names any of these points as an established planetary analog; this says what could be confirmed nearby.
 */
export const INDEPENDENT: Record<string, { verdict: "Supported nearby" | "Partly" | "None found" | "Not checked"; text: string; url?: string; image?: { label: string; url: string } }> = {
  "m1-eva-basalt-new1": { verdict: "Supported nearby", text: "The Harrat al Birk volcanic field (about 200 scoria cones over 1,800 km², Smithsonian Global Volcanism Program) lies about 17 km away. It is an old, weathered lava field; no analog study was found.", url: "https://volcano.si.edu/volcano.cfm?vn=231072", image: { label: "Landsat image of Harrat al Birk (USGS, public domain; Wikimedia Commons)", url: "https://commons.wikimedia.org/wiki/File:Harrat_Al_Birk,_Saudi_Arabia.jpg" } },
  "m1-eva-basalt-new2": { verdict: "None found", text: "No source found for basaltic lava fields at this point in Santa Cruz. NASA Earth Observatory shows bare lava plateaus elsewhere in Patagonia, which does not confirm this region." },
  "m1-eva-basalt-new3": { verdict: "Partly", text: "The Marsabit shield volcano, with unvegetated young lava flows (Smithsonian Global Volcanism Program), is about 185 km to the south-east. Nothing was found for the point itself.", url: "https://volcano.si.edu/volcano.cfm?vn=222021" },
  "m1-eva-basalt-new4": { verdict: "Partly", text: "The Pilbara is a known analog for the search for ancient life (NASA JPL, 2019), not for suited traverses on lava fields.", url: "https://www.jpl.nasa.gov/news/mars-scientists-investigate-ancient-life-in-australia/" },
  "m1-eva-basalt-new5": { verdict: "Supported nearby", text: "The Somuncura province is a back-arc field of mafic lava flows of more than 55,000 km², with plateau lavas sampled near Valcheta, about 93 km away (Kay et al. 2007, Journal of Petrology). Whether this point itself lies on the lava was not verified.", url: "https://bibliotecadigital.exactas.uba.ar/download/paper/paper_00223530_v48_n1_p43_Kay.pdf" },
  "m2-rover-sand-new1": { verdict: "Partly", text: "Only weak, indirect support was found for sandy ground in this region." },
  "m2-rover-sand-new2": { verdict: "None found", text: "No verifiable source found for this region." },
  "m2-rover-sand-new3": { verdict: "Partly", text: "Oman hosted a full Mars analog mission (AMADEE-18), but in Dhofar, about 500 km to the south; nothing describes sand at this point." },
  "m2-rover-sand-new4": { verdict: "None found", text: "No source found for this region." },
  "m2-rover-sand-new6": { verdict: "Partly", text: "The Médanos Grandes dune field is nearby, but it is described as largely inactive, which weakens it as a test of loose, moving sand.", image: { label: "Satellite image of Médanos Grandes (CC BY-SA 2.0; Wikimedia Commons)", url: "https://commons.wikimedia.org/wiki/File:M%C3%A9danos_Grandes,_Argentina.jpg" } },
  "m2-rover-sand-new7": { verdict: "Partly", text: "A land-cover study of the whole Qiangtang Plateau, which contains this point, reports 26 % bare land and sand-covered ground in a cold, dry, windy climate (Bian et al. 2023, Frontiers in Environmental Science). It does not map dunes or name this county.", url: "https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2023.1217225/full" },
  "m3-ground-ice-new1": { verdict: "Supported nearby", text: "Northern Ellesmere Island is a permafrost polar desert with ground ice in the literature; the documented sites are about 300 km away on the same island.", image: { label: "Sentinel-2 image of Lake Hazen, northern Ellesmere (Wikimedia Commons)", url: "https://commons.wikimedia.org/wiki/File:Lake_Hazen_2022-07-16_Sentinel-2_L2A_Highlight_Optimized_Natural_Color.jpg" } },
  "m3-ground-ice-new2": { verdict: "Supported nearby", text: "Banks Island has ice-rich continuous permafrost (Lewkowicz & Way 2019, Nature Communications). No analog study was found." },
  "m3-ground-ice-new7": { verdict: "Supported nearby", text: "Permafrost ice wedges were sampled on Kotelny Island, about 90 km away on the same island (Opel et al. 2019, Alfred Wegener Institute dataset on PANGAEA).", url: "https://doi.pangaea.de/10.1594/PANGAEA.904091" },
  "m3-ground-ice-new8": { verdict: "Partly", text: "A national ground-ice model places Baffin Island in continuous permafrost; the ice-rich areas it names are about 209 km away (O'Neill et al. 2019, The Cryosphere). Nothing specific to this point was found.", url: "https://tc.copernicus.org/articles/13/753/2019/" },
  "m4-low-sun-new1": { verdict: "Partly", text: "Only a year-round permafrost research station was found: the CEN station at Salluit, about 129 km away (UArctic research-infrastructure catalogue). Nothing describes bare ground at this point.", url: "https://research.uarctic.org/resources/infrastructure/details/?id=29128" },
  "m4-low-sun-new2": { verdict: "Supported nearby", text: "A 2023 Europlanet field campaign studied glacial and periglacial landforms around Kangerlussuaq, about 82 km away, as analogues for Mars (field report, not a journal paper).", url: "https://www.europlanet.org/wp-content/uploads/ninja-forms/46/Europlanet_report_Kangerlussuaq_AGG2023-signed.pdf" },
  "m4-low-sun-new3": { verdict: "Partly", text: "Weak: the nearest source is a permafrost monitoring site at Lavrentiya, about 309 km away, described as wet mossy tundra, not bare ground (GTN-P database).", url: "https://gtnpdatabase.org/activelayers/view/68" },
  "m4-low-sun-new4": { verdict: "Supported nearby", text: "Gullies on basalt fjord slopes above Ísafjörður, about 57 km away, are described as a good analogue for Martian gullies (Conway et al. 2008, Lunar and Planetary Institute workshop abstract).", url: "https://www.lpi.usra.edu/meetings/gullies2008/pdf/8024.pdf" },
};
const EVIDENCE_OF: Record<string, Evidence> = { "Supported nearby": "nearby", Partly: "partial", "None found": "none", "Not checked": "unchecked" };
/** Evidence levels, strongest first: the main badge of every site and the order of the list (the index does not tell the new regions apart). */
export const EVIDENCE: Record<Evidence, { label: string; group: string; note: string; color: string; pips: number }> = {
  agency: { label: "Used by agencies", group: "Used by agencies", note: "A real field campaign ran here.", color: "#7ef0c1", pips: 4 },
  nearby: { label: "Support nearby", group: "New regions · support nearby", note: "New region: an independent source confirms the key property close to this point.", color: "#5ee6ff", pips: 3 },
  partial: { label: "Partial support", group: "New regions · partial support", note: "New region: only indirect or distant support was found.", color: "#ffb454", pips: 2 },
  none: { label: "No support found", group: "New regions · no support found", note: "New region: we looked for independent sources and found none.", color: "#b9c2d3", pips: 1 },
  unchecked: { label: "Not checked", group: "New regions · not checked", note: "New region: no independent check was done yet.", color: "#8392ac", pips: 0 },
};
export const EVIDENCE_ORDER: Evidence[] = ["agency", "nearby", "partial", "none", "unchecked"];



const lon180 = (l: number) => (l > 180 ? l - 360 : l);

export const MISSIONS: Mission[] = data.missions.map((m) => {
  const vars: Variable[] = m.variables.map((v) => ({ id: v.id, label: v.label, unit: v.unit, why: v.why, inMatch: v.inMatch, ideal: v.ideal ?? null, tolerance: v.tolerance ?? null }));
  const byId = new Map(vars.map((v) => [v.id, v]));
  const sites: Site[] = m.sites.filter((s) => !(s.id in REMOVED)).map((s) => ({
    rank: null,
    of: null,
    id: s.id,
    areaKm2: s.region?.areaKm2 ?? null,
    name: ((parts) => (parts.length > 2 && /^(Asia|Africa|Europe|North America|South America|Oceania)$/.test(parts[0]) ? parts.slice(1) : parts.length > 2 ? [parts[0], parts[parts.length - 1]] : parts).join(" · "))(s.name.replace(/^Candidate cell near /, "").split(" · ")), // geographic region + province (or district + province when the first part is only a continent)
    country: s.country,
    lat: s.lat,
    lon: lon180(s.lon),
    kind: s.kind,
    match: s.match,
    percentile: s.matchPercentile ?? null,
    vars: Object.entries(s.perVariable).map(([id, p]) => ({ id, label: byId.get(id)?.label ?? id, unit: byId.get(id)?.unit ?? "", value: p?.value ?? null, similarity: p?.similarity ?? null, source: p?.source ?? "no data", inMatch: p?.inMatch ?? byId.get(id)?.inMatch ?? true })),
    breaks: s.breaks,
    access: accessOf(s.accessRisk, s.id),
    campaign: s.campaign ?? null,
    travelH: HOW[s.id]?.how?.travelTimeToCityHours ?? null,
    slopeDeg: TERRAIN[s.id]?.stats.slopeMeanDeg ?? null,
    evidence: s.kind === "known" ? "agency" : EVIDENCE_OF[INDEPENDENT[s.id]?.verdict ?? "Not checked"],
  }));
  // New candidates keep the order Logos Datos ranked them in; known analogs by match.
  sites.sort((a, b) => Number(b.kind === "new") - Number(a.kind === "new") || (a.kind === "new" ? 0 : (b.match ?? -1) - (a.match ?? -1)));
  const fresh = sites.filter((x) => x.kind === "new");
  fresh.forEach((x, i) => { x.rank = i + 1; x.of = fresh.length; });
  return {
    id: m.id,
    title: m.title,
    ...COPY[m.id],
    always: m.breaks?.length ? m.breaks : COPY[m.id].always.map((text) => ({ text, source: "NASA NSSDC planetary fact sheets", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/" })),
    target: { ...m.target, lon: lon180(m.target.lon) },
    campaigns: m.campaigns,
    variables: vars,
    sites,
    landCells: m.validation.landCells ?? null,
    validation: { method: m.validation.method, result: m.validation.result, controlPercentile: m.validation.control?.matchPercentile ?? null },
    validated: m.validation.validated !== false,
  };
});

export const DATA_DATE = data.generatedAt.slice(0, 10);
export const DATA_VERSION = data.version;
export const missionById = (id: MissionId) => MISSIONS.find((m) => m.id === id)!;

/** Real analog campaigns we did not score: not driven by terrain, or no global data to compare. Facts and links from docs/missions.md. */
export const NEXT_MISSIONS: { name: string; who: string; what: string; url: string }[] = [
  { name: "CAVES", who: "ESA", what: "Astronaut teams working underground in Sardinian caves, a stand-in for lava tubes (2011–2019).", url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Going_underground" },
  { name: "ARCHES", who: "DLR, ESA, KIT", what: "A lander, two rovers and a drone working together on Mount Etna, with a rover driven remotely (2022).", url: "https://www.dlr.de/en/rm/latest/news/2022/robotics-team-practises-lunar-exploration-on-mount-etna" },
  { name: "PISCES / ACME landing pad", who: "NASA KSC Swamp Works, PISCES", what: "A teleoperated rover laid 100 sintered basalt pavers to build a landing pad in Hawai'i (2015).", url: "https://pacificspacecenter.com/2016/01/05/pisces-completes-lunar-landing-pad-bullseye/" },
  { name: "NEEMO", who: "NASA", what: "Spacewalk operations and isolation in the Aquarius undersea station, Florida (23 missions, 2001–2019).", url: "https://www.nasa.gov/gallery/neemo/" },
  { name: "CHAPEA", who: "NASA", what: "Year-long simulated Mars surface stays inside a 3D-printed habitat at Johnson Space Center.", url: "https://www.nasa.gov/humans-in-space/chapea/" },
  { name: "AMADEE", who: "Austrian Space Forum", what: "Full Mars surface simulations with suits, rovers and a habitat (Oman 2018, Israel 2021, Armenia 2024).", url: "https://oewf.org/en/" },
];

/** Declared thresholds of the list filters (team choices). None of them is part of the analog index. */
export const FILTERS = { reachH: 6, remoteH: 48, flatDeg: 5 } as const;
export type Reach = "any" | "near" | "remote";
export type Ground = "any" | "flat" | "steep";
export interface ListFilter { reach: Reach; ground: Ground; lowAccess: boolean }
export const NO_FILTER: ListFilter = { reach: "any", ground: "any", lowAccess: false };
/** A site passes when it meets every active filter; a site without the needed figure does not pass that filter. */
export function passes(s: Site, f: ListFilter): boolean {
  if (f.reach === "near" && !(s.travelH !== null && s.travelH < FILTERS.reachH)) return false;
  if (f.reach === "remote" && !(s.travelH !== null && s.travelH > FILTERS.remoteH)) return false;
  if (f.ground === "flat" && !(s.slopeDeg !== null && s.slopeDeg <= FILTERS.flatDeg)) return false;
  if (f.ground === "steep" && !(s.slopeDeg !== null && s.slopeDeg > FILTERS.flatDeg)) return false;
  if (f.lowAccess && !(s.access.level === "Low" && !s.access.permit)) return false;
  return true;
}
/** The list in its display order: by evidence level, then known analogs by index and new regions in the order they were ranked. */
export function byEvidence(sites: Site[]): Site[] {
  return [...sites].sort((a, b) => EVIDENCE_ORDER.indexOf(a.evidence) - EVIDENCE_ORDER.indexOf(b.evidence) || (a.kind === "known" ? (b.match ?? -1) - (a.match ?? -1) : (a.rank ?? 99) - (b.rank ?? 99)));
}
/** Short name for the globe: the place before the comma or the first part of "region · province", made unique within the mission. */
export function sceneLabel(s: Site, all: Site[]): string {
  if (s.kind === "known") return s.name.split(",")[0];
  const parts = s.name.split(" · "), head = (x: Site) => { const p = x.name.split(" · "); return p[0] === x.country && p.length > 1 ? p[p.length - 1] : p[0]; };
  const h = head(s), twins = all.filter((o) => o !== s && o.kind === "new" && head(o) === h);
  if (!twins.length) return h;
  return twins.every((o) => o.country !== s.country) && s.country ? `${h} · ${s.country}` : `${h} · ${parts[parts.length - 1]}`;
}

export const idx = (x: number | null) => (x === null ? "–" : x.toFixed(3));
/** Why the index does not rank the new regions of a mission. */
export const topNote = (m: Mission) => (m.validated ? TOP_NOTE : "For this mission the index is the plain mean of the condition similarities. All its new regions meet every condition, so they all read 1.000 and the index cannot rank them: 238 candidates were screened on the ground to find these four. It is computed, not validated; the independent check is about the ground nearby, not about low-Sun work.");
export const TOP_NOTE = "New regions are picked because they sit at the top of the index, so they score above the known analogs and within a few thousandths of each other, less than the uncertainty of the data: read them as a shortlist, not a ranking. The index compares surface conditions; it is not a measure of suitability.";

export const fmt = (x: number | null, unit = "") => {
  if (x === null || Number.isNaN(x)) return "–";
  const a = Math.abs(x), s = a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : a >= 1 ? x.toFixed(1) : x.toFixed(2);
  const u = unit === "degC" ? " °C" : unit === "deg" ? "°" : unit === "%" ? " %" : unit === "mm/yr" ? " mm/yr" : "";
  return s + u;
};
