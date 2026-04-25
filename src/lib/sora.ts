/**
 * AIRBASE SORA (Specific Operations Risk Assessment) Engine
 *
 * Implements a simplified SORA v2.5 assessment for the DJI FlyCart 100
 * operating in Swiss airspace, primarily the Berner Oberland corridors.
 *
 * DJI FlyCart 100 weight references:
 *   - Manufacturer MTOW: 170 kg (DJI spec sheet)
 *   - Operational limit:  149.9 kg per flight (AIRBASE policy — stays below
 *     150 kg threshold to remain in EASA SPECIFIC category and avoid
 *     CERTIFIED category requirements)
 *
 * Reference: EASA SORA v2.5 (AMC1 UAS.SPEC.040), EASA ED Decision 2025/018/R,
 * and BAZL Betriebshandbuch.
 *
 * IMPORTANT: This is a decision-support tool, not a certified assessment tool.
 * All flights require operator sign-off and may require official BAZL authorization.
 *
 * At the 149.9 kg operational limit, all operations fall into the SPECIFIC category
 * and require a SORA assessment + BAZL operator authorisation.
 */

import * as turf from "@turf/turf";
import { requiresBernBelpPermit, routeIntersectsControlledAirspace } from "./geo";

// ─── GRC — Ground Risk Class ──────────────────────────────────────────────────

/**
 * Ground Risk Classes (1–7+) based on operational area population density
 * and populated area type (SORA Table 1).
 */
export type GRCLevel =
  | 1  // Controlled ground area, low density
  | 2  // Sparsely populated area
  | 3  // Populated area (rural villages, small towns)
  | 4  // Densely populated area (urban)
  | 5  // Gatherings of people (markets, events)
  | 6  // Very high density urban
  | 7; // Max — not practically used for ops

/**
 * GRC labels for UI display
 */
export const GRC_LABELS: Record<GRCLevel, string> = {
  1: "GRC 1 — Kontrollierte Fläche",
  2: "GRC 2 — Dünn besiedelt",
  3: "GRC 3 — Besiedelt (ländlich)",
  4: "GRC 4 — Dicht besiedelt (urban)",
  5: "GRC 5 — Menschenansammlungen",
  6: "GRC 6 — Sehr dicht (Stadtzentrum)",
  7: "GRC 7 — Maximum",
};

// ─── ARC — Air Risk Class ─────────────────────────────────────────────────────

export type ARCLevel = "a" | "b" | "c" | "d";

export const ARC_LABELS: Record<ARCLevel, string> = {
  a: "ARC-a — Unkontrollierter Luftraum, niedrig",
  b: "ARC-b — Unkontrollierter Luftraum, mittel",
  c: "ARC-c — Kontrollierter Luftraum (CTR/TMA)",
  d: "ARC-d — Stark frequentierter Luftraum",
};

// ─── SAIL — Specific Assurance and Integrity Level ───────────────────────────

export type SAILLevel = "I" | "II" | "III" | "IV" | "V" | "VI";

/**
 * SAIL lookup table — JARUS SORA v2.5 / EASA ED Decision 2025/018/R
 * AMC1 UAS.SPEC.040 Table 3 (GRC rows × ARC cols).
 *
 * Verified 2026-04-25 against official JARUS SORA v2.5 Main Body (JAR_doc_25).
 * Note: GRC 1 and 2 share the same row (≤2) in the official table.
 *
 * Source: https://dronetalks.online/blog/step-7-of-the-sora-methodology-final-specific-assurance-and-integrity-level-sail-and-operational-safety-objectives-oso-assignment/
 */
const SAIL_TABLE: Record<GRCLevel, Record<ARCLevel, SAILLevel>> = {
  1: { a: "I",   b: "II",  c: "IV", d: "VI" },
  2: { a: "I",   b: "II",  c: "IV", d: "VI" },
  3: { a: "II",  b: "II",  c: "IV", d: "VI" },
  4: { a: "III", b: "III", c: "IV", d: "VI" },
  5: { a: "IV",  b: "IV",  c: "IV", d: "VI" },
  6: { a: "V",   b: "V",   c: "V",  d: "VI" },
  7: { a: "VI",  b: "VI",  c: "VI", d: "VI" },
};

// ─── SORA Category ────────────────────────────────────────────────────────────

/**
 * SORA Operational Category.
 * All DJI FlyCart 100 operations are SPECIFIC (operational weight > 25 kg, capped
 * at 149.9 kg to stay below 150 kg CERTIFIED threshold) and require BAZL authorisation.
 */
export type SoraCategory = "OPEN_A1" | "OPEN_A2" | "OPEN_A3" | "SPECIFIC" | "CERTIFIED";

// ─── GRC Zone Infrastructure ──────────────────────────────────────────────────

interface GRCZone {
  id: string;
  name: string;
  grc: GRCLevel;
  description: string;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  /** Special restriction flag (military, hazardous operations area) */
  restricted?: boolean;
  restrictedReason?: string;
}

// ─── Hochalpine GRC-1-Zonen ───────────────────────────────────────────────────

/**
 * GRC-1-Zonen: Gletscher, Gipfelgebiete und unbewohnte Hochlagen (>2500m ü.M.).
 * Grundlage: BFS STATPOP (kein permanenter Wohnbevölkerungsanteil) und
 * Swisstopo DHM25-Höhenmodell. Klassifizierung gemäss JARUS SORA v2.5 Table 1:
 * GRC 1 = «Controlled ground area» (keine unbeteiligten Personen am Boden).
 */
const ALPINE_GRC1_ZONES: GRCZone[] = [
  {
    id: "jungfrau_hochalpin",
    name: "Jungfrauregion Hochalpin",
    grc: 1,
    description: "Eiger, Mönch, Jungfrau — kein permanenter Siedlungsraum über 2800m ü.M.",
    bounds: { minLat: 46.52, maxLat: 46.58, minLng: 7.93, maxLng: 8.05 },
  },
  {
    id: "aletschgletscher",
    name: "Grosser Aletschgletscher",
    grc: 1,
    description: "UNESCO-Weltnaturerbe, grösster Gletscher der Alpen — vollständig unbewohnt",
    bounds: { minLat: 46.42, maxLat: 46.58, minLng: 7.97, maxLng: 8.18 },
  },
  {
    id: "bernese_alps_core",
    name: "Berner Hochalpen Kernbereich",
    grc: 1,
    description: "Finsteraarhorn, Lauteraarhorn — unbewohntes Hochgebirge",
    bounds: { minLat: 46.53, maxLat: 46.62, minLng: 8.07, maxLng: 8.25 },
  },
  {
    id: "wetterhorn_hochalpin",
    name: "Wetterhorn / Rosenlaui Hochalpin",
    grc: 1,
    description: "Hochalpines Gebiet östlich Grindelwald — kein Siedlungsraum",
    bounds: { minLat: 46.62, maxLat: 46.68, minLng: 8.04, maxLng: 8.15 },
  },
  {
    id: "doldenhorn_gspaltenhorn",
    name: "Doldenhorn / Gspaltenhorn Hochalpin",
    grc: 1,
    description: "Südlicher Wandflühenbereich Berner Oberland — unbewohnt",
    bounds: { minLat: 46.45, maxLat: 46.56, minLng: 7.68, maxLng: 7.88 },
  },
  {
    id: "gemmi_rawil_hochalpin",
    name: "Gemmi / Rawilpass Hochalpin",
    grc: 1,
    description: "Übergang Wallis–Berner Oberland — Hochalpin, unbewohnt",
    bounds: { minLat: 46.38, maxLat: 46.46, minLng: 7.60, maxLng: 7.78 },
  },
  {
    id: "matterhorn_zermatt_hochalpin",
    name: "Matterhorn / Zermatt Hochalpin",
    grc: 1,
    description: "Gipfelgebiet Matterhorn, Monte Rosa-Gruppe — kein Siedlungsraum",
    bounds: { minLat: 45.93, maxLat: 46.03, minLng: 7.60, maxLng: 7.82 },
  },
  {
    id: "gornergletscher",
    name: "Gornergletscher",
    grc: 1,
    description: "Zweitgrösster Gletscher der Alpen — vollständig unbewohnt",
    bounds: { minLat: 45.93, maxLat: 46.00, minLng: 7.72, maxLng: 7.87 },
  },
  {
    id: "gotthard_hochalpin",
    name: "Gotthardmassiv Hochalpin",
    grc: 1,
    description: "Gotthard, Passo del San Gottardo — kein permanenter Siedlungsraum",
    bounds: { minLat: 46.54, maxLat: 46.64, minLng: 8.53, maxLng: 8.63 },
  },
  {
    id: "silvretta_hochalpin",
    name: "Silvrettagruppe Hochalpin",
    grc: 1,
    description: "Graubünden/Vorarlberg — Gletscher und Hochgipfel, unbewohnt",
    bounds: { minLat: 46.82, maxLat: 46.95, minLng: 10.03, maxLng: 10.25 },
  },
  {
    id: "bernina_hochalpin",
    name: "Berninagruppe Hochalpin",
    grc: 1,
    description: "Piz Bernina, Morteratschgletscher — kein permanenter Siedlungsraum",
    bounds: { minLat: 46.35, maxLat: 46.48, minLng: 9.87, maxLng: 10.07 },
  },
  {
    id: "adula_hochalpin",
    name: "Adulagruppe / Rheinwaldhorn Hochalpin",
    grc: 1,
    description: "Graubünden Hochgebirge — kein Siedlungsraum",
    bounds: { minLat: 46.44, maxLat: 46.55, minLng: 9.03, maxLng: 9.22 },
  },
];

// ─── Dünn besiedelte Alpine GRC-2-Zonen ──────────────────────────────────────

/**
 * GRC-2-Zonen: Dünn besiedelte Hochalpentäler (saisonal genutzte Alpweiden,
 * vereinzelte Alphütten, kein permanenter Siedlungsraum).
 * Klassifizierung gemäss JARUS SORA v2.5 Table 1: GRC 2 = «Sparsely populated area».
 */
const ALPINE_GRC2_ZONES: GRCZone[] = [
  {
    id: "lotschental",
    name: "Lötschental",
    grc: 2,
    description: "Abgelegenes Walliser Hochtal — sehr geringe Besiedlung",
    bounds: { minLat: 46.38, maxLat: 46.47, minLng: 7.72, maxLng: 7.90 },
  },
  {
    id: "goms_oberwallis",
    name: "Goms / Oberwallis",
    grc: 2,
    description: "Oberes Rhonetal ab Brig — dünn besiedelt, landwirtschaftlich geprägt",
    bounds: { minLat: 46.44, maxLat: 46.55, minLng: 8.18, maxLng: 8.48 },
  },
  {
    id: "grimselgebiet",
    name: "Grimsel / oberes Haslital",
    grc: 2,
    description: "Stauseegebiet Grimsel — vereinzelte Anlagen, keine Dauerbesiedlung",
    bounds: { minLat: 46.55, maxLat: 46.63, minLng: 8.18, maxLng: 8.35 },
  },
  {
    id: "ursern_hochtal",
    name: "Urserental (Andermatt Umgebung)",
    grc: 2,
    description: "Hochtal südlich Gotthard — dünn besiedelt",
    bounds: { minLat: 46.60, maxLat: 46.68, minLng: 8.55, maxLng: 8.67 },
  },
  {
    id: "simmental_oberes",
    name: "Simmental (oberes) / Lenk",
    grc: 2,
    description: "Oberes Simmental / Lenk — alpine Landwirtschaft, dünn besiedelt",
    bounds: { minLat: 46.43, maxLat: 46.55, minLng: 7.38, maxLng: 7.52 },
  },
  {
    id: "saanental_oberes",
    name: "Saanetal (oberes) / Château-d'Oex",
    grc: 2,
    description: "Waadtländer Voralpen — dünn besiedelt",
    bounds: { minLat: 46.46, maxLat: 46.56, minLng: 7.12, maxLng: 7.28 },
  },
  {
    id: "safiental",
    name: "Safiental / Vals (Graubünden)",
    grc: 2,
    description: "Abgelegenes Bündner Hochtal — sehr geringe Besiedlung",
    bounds: { minLat: 46.57, maxLat: 46.70, minLng: 9.12, maxLng: 9.32 },
  },
  {
    id: "leventina_obere",
    name: "Leventina (oberes Tessin)",
    grc: 2,
    description: "Oberes Tessin — alpin, dünn besiedelt",
    bounds: { minLat: 46.48, maxLat: 46.58, minLng: 8.67, maxLng: 8.82 },
  },
];

// ─── Urbane GRC-4/5-Zonen ─────────────────────────────────────────────────────

/**
 * Städtische Siedlungsgebiete der Schweiz.
 * Grundlage: BFS STATPOP Bevölkerungsdichte >500 Einwohner/km².
 * Klassifizierung gemäss JARUS SORA v2.5 Table 1:
 * GRC 4 = «Densely populated area (urban)», GRC 5 = sehr dicht besiedelt.
 */
const URBAN_ZONES: GRCZone[] = [
  {
    id: "bern_city",
    name: "Bern Stadtgebiet",
    grc: 4,
    description: "Bundeshauptstadt Bern — dicht besiedelt, urbane Kernzone",
    bounds: { minLat: 46.91, maxLat: 46.98, minLng: 7.40, maxLng: 7.52 },
  },
  {
    id: "bern_agglo_west",
    name: "Bern Agglomeration West (Bümpliz/Brünnen)",
    grc: 4,
    description: "Berner Agglomeration West — dicht besiedelt",
    bounds: { minLat: 46.93, maxLat: 46.97, minLng: 7.36, maxLng: 7.42 },
  },
  {
    id: "zuerich_city",
    name: "Zürich Stadtgebiet",
    grc: 5,
    description: "Grösststadt der Schweiz — sehr dicht besiedelt",
    bounds: { minLat: 47.33, maxLat: 47.43, minLng: 8.47, maxLng: 8.60 },
  },
  {
    id: "zuerich_agglo",
    name: "Zürich Agglomeration",
    grc: 4,
    description: "Zürich Agglomerationsgürtel — dicht besiedelt",
    bounds: { minLat: 47.25, maxLat: 47.50, minLng: 8.43, maxLng: 8.68 },
  },
  {
    id: "basel_city",
    name: "Basel Stadtgebiet",
    grc: 5,
    description: "Dreiländereck — sehr dicht besiedelt",
    bounds: { minLat: 47.53, maxLat: 47.59, minLng: 7.55, maxLng: 7.63 },
  },
  {
    id: "genf_city",
    name: "Genf Stadtgebiet (Genève)",
    grc: 5,
    description: "Internationales Zentrum — sehr dicht besiedelt",
    bounds: { minLat: 46.18, maxLat: 46.25, minLng: 6.10, maxLng: 6.20 },
  },
  {
    id: "lausanne_city",
    name: "Lausanne Stadtgebiet",
    grc: 4,
    description: "Kantonshauptstadt Waadt — dicht besiedelt",
    bounds: { minLat: 46.50, maxLat: 46.56, minLng: 6.60, maxLng: 6.70 },
  },
  {
    id: "winterthur_city",
    name: "Winterthur Stadtgebiet",
    grc: 4,
    description: "Industriestadt Winterthur — dicht besiedelt",
    bounds: { minLat: 47.49, maxLat: 47.53, minLng: 8.70, maxLng: 8.77 },
  },
  {
    id: "luzern_city",
    name: "Luzern Stadtgebiet",
    grc: 4,
    description: "Zentralschweizer Hauptort — dicht besiedelt",
    bounds: { minLat: 47.03, maxLat: 47.08, minLng: 8.27, maxLng: 8.33 },
  },
  {
    id: "stgallen_city",
    name: "St. Gallen Stadtgebiet",
    grc: 4,
    description: "Kantonshauptstadt Ostschweiz — dicht besiedelt",
    bounds: { minLat: 47.41, maxLat: 47.45, minLng: 9.35, maxLng: 9.42 },
  },
  {
    id: "fribourg_city",
    name: "Freiburg/Fribourg Stadtgebiet",
    grc: 4,
    description: "Kantonshauptstadt — dicht besiedelt",
    bounds: { minLat: 46.79, maxLat: 46.82, minLng: 7.14, maxLng: 7.18 },
  },
  {
    id: "biel_bienne_city",
    name: "Biel/Bienne Stadtgebiet",
    grc: 3,
    description: "Bilinguale Uhrenstadt — besiedelt (ländliches Umfeld)",
    bounds: { minLat: 47.12, maxLat: 47.16, minLng: 7.24, maxLng: 7.29 },
  },
  {
    id: "thun_city",
    name: "Thun Stadtgebiet",
    grc: 3,
    description: "Regionales Zentrum Berner Oberland — besiedelt",
    bounds: { minLat: 46.74, maxLat: 46.78, minLng: 7.60, maxLng: 7.64 },
  },
  {
    id: "sion_city",
    name: "Sitten/Sion Stadtgebiet",
    grc: 3,
    description: "Kantonshauptstadt Wallis — besiedelt",
    bounds: { minLat: 46.22, maxLat: 46.26, minLng: 7.34, maxLng: 7.40 },
  },
  {
    id: "brig_city",
    name: "Brig-Glis Stadtgebiet",
    grc: 3,
    description: "Walliser Fernverkehrsknoten — besiedelt",
    bounds: { minLat: 46.30, maxLat: 46.34, minLng: 7.98, maxLng: 8.03 },
  },
  {
    id: "chur_city",
    name: "Chur Stadtgebiet",
    grc: 3,
    description: "Kantonshauptstadt Graubünden — besiedelt",
    bounds: { minLat: 46.84, maxLat: 46.87, minLng: 9.52, maxLng: 9.56 },
  },
  {
    id: "schaffhausen_city",
    name: "Schaffhausen Stadtgebiet",
    grc: 3,
    description: "Kantonshauptstadt Schaffhausen — besiedelt (ca. 37'000 Einwohner)",
    bounds: { minLat: 47.68, maxLat: 47.72, minLng: 8.61, maxLng: 8.66 },
  },
  {
    id: "bellinzona_city",
    name: "Bellinzona Stadtgebiet",
    grc: 3,
    description: "Kantonshauptstadt Tessin — besiedelt (ca. 43'000 Einwohner)",
    bounds: { minLat: 46.17, maxLat: 46.21, minLng: 9.01, maxLng: 9.06 },
  },
  {
    id: "appenzell_city",
    name: "Appenzell Stadtgebiet",
    grc: 3,
    description: "Hauptort Appenzell Innerrhoden — besiedelt (ca. 6'000 Einwohner)",
    bounds: { minLat: 47.32, maxLat: 47.35, minLng: 9.39, maxLng: 9.43 },
  },
];

// ─── Militärische Sonderzonen und Gefahrengebiete ─────────────────────────────

/**
 * Militärische Schiessgebiete und Militärflugplätze.
 * GRC bleibt gemäss Geländecharakter, aber Überflüge erfordern zusätzliche
 * Genehmigungen (NOTAM-Prüfung, VBS-Koordination).
 * Rechtsgrundlage: Militärgesetz (MG, SR 510.10) Art. 80; LFV SR 748.132.1.
 */
const RESTRICTED_ZONES: GRCZone[] = [
  {
    id: "axalp_schiesgebiet",
    name: "Axalp Militär-Schiessgebiet",
    grc: 1,
    description: "Schweizerische Luftwaffe Übungsgebiet Brienzersee-Südufer",
    bounds: { minLat: 46.66, maxLat: 46.72, minLng: 7.99, maxLng: 8.09 },
    restricted: true,
    restrictedReason: "Militärisches Schiessgebiet (Axalp/LSMM) — aktiver Schiessbetrieb möglich; Überflug nur mit VBS-Genehmigung und aktueller NOTAM-Prüfung",
  },
  {
    id: "andermatt_schiesgebiet",
    name: "Andermatt Militär-Schiessgebiet",
    grc: 1,
    description: "Armeeschiessplatz Andermatt — aktiver Schiessbetrieb möglich",
    bounds: { minLat: 46.62, maxLat: 46.68, minLng: 8.57, maxLng: 8.68 },
    restricted: true,
    restrictedReason: "Militärisches Schiessgebiet (Andermatt) — Überflug nur mit VBS-Genehmigung und NOTAM-Prüfung",
  },
  {
    id: "oberalp_schiesgebiet",
    name: "Oberalp Schiessgebiet",
    grc: 1,
    description: "Schiessgebiet Oberalp — sporadischer Schiessbetrieb",
    bounds: { minLat: 46.65, maxLat: 46.70, minLng: 8.65, maxLng: 8.72 },
    restricted: true,
    restrictedReason: "Militärisches Schiessgebiet Oberalp — NOTAM-Prüfung obligatorisch",
  },
  {
    id: "meiringen_militaer",
    name: "Militärflugplatz Meiringen (LSMM)",
    grc: 2,
    description: "Militärflugplatz der Schweizer Luftwaffe — eingeschränkter Luftraum",
    bounds: { minLat: 46.73, maxLat: 46.76, minLng: 8.07, maxLng: 8.12 },
    restricted: true,
    restrictedReason: "Militärflugplatz Meiringen (LSMM) — Koordination mit Militärflugplatzkontrolle (TWR LSMM) erforderlich",
  },
  {
    id: "emmen_militaer",
    name: "Militärflugplatz Emmen (LSME)",
    grc: 4,
    description: "Militärflugplatz Emmen — eingeschränkter Luftraum (TMA Emmen)",
    bounds: { minLat: 47.06, maxLat: 47.09, minLng: 8.27, maxLng: 8.32 },
    restricted: true,
    restrictedReason: "Militärflugplatz Emmen (LSME) — Koordination mit Militärflugplatzkontrolle erforderlich",
  },
  {
    id: "payerne_militaer",
    name: "Militärflugplatz Payerne (LSMP)",
    grc: 2,
    description: "Militärflugplatz Payerne — aktiver Militärbetrieb",
    bounds: { minLat: 46.82, maxLat: 46.86, minLng: 6.89, maxLng: 6.94 },
    restricted: true,
    restrictedReason: "Militärflugplatz Payerne (LSMP) — Koordination mit Militärflugplatzkontrolle erforderlich",
  },
  {
    id: "sion_militaer",
    name: "Flughafen/Militärflugplatz Sion (LSGS)",
    grc: 3,
    description: "Zivil-militärischer Flughafen Sion — CTR und Militärbetrieb",
    bounds: { minLat: 46.20, maxLat: 46.24, minLng: 7.31, maxLng: 7.36 },
    restricted: true,
    restrictedReason: "Militärflugplatz Sion (LSGS) — CTR-Freigabe und militärische Koordination erforderlich",
  },
];

// ─── Berner Oberland Corridors (validiert) ────────────────────────────────────

/**
 * Validierte Berner Oberland Lieferkorridore.
 * GRC-Werte wurden anhand Geländecharakter, Swisstopo-Kartenmaterial und
 * BFS STATPOP-Bevölkerungsdaten verifiziert.
 *
 * @deprecated Verwende stattdessen die umfassende Zonendatenbank (ALPINE_GRC1_ZONES,
 * ALPINE_GRC2_ZONES, URBAN_ZONES). Diese Korridore bleiben für API-Kompatibilität erhalten.
 */
export const BERNER_OBERLAND_CORRIDORS = [
  {
    id: "interlaken_grindelwald",
    name: "Interlaken — Grindelwald",
    grc: 2 as GRCLevel,
    description: "Alpines Tal, dünn besiedelt (GRC-2 validiert: Bevölkerungsdichte <50 E/km²)",
    bounds: { minLat: 46.60, maxLat: 46.72, minLng: 7.85, maxLng: 8.10 },
  },
  {
    id: "thun_interlaken",
    name: "Thun — Interlaken",
    grc: 3 as GRCLevel,
    description: "Gemischt ländlich/städtisch entlang Thuner See (GRC-3 validiert: Dörfer, Thuner Stadtrand)",
    bounds: { minLat: 46.60, maxLat: 46.80, minLng: 7.55, maxLng: 7.90 },
  },
  {
    id: "bern_koniz",
    name: "Bern — Köniz",
    grc: 4 as GRCLevel,
    description: "Suburban Bern/Köniz (GRC-4 validiert: urban, >500 E/km²)",
    bounds: { minLat: 46.89, maxLat: 46.96, minLng: 7.38, maxLng: 7.50 },
  },
  {
    id: "spiez_kandersteg",
    name: "Spiez — Kandersteg",
    grc: 2 as GRCLevel,
    description: "Ländlicher Alpinkorridor (GRC-2 validiert: <50 E/km², Kandertal)",
    bounds: { minLat: 46.53, maxLat: 46.68, minLng: 7.60, maxLng: 7.75 },
  },
  {
    id: "brienz_meiringen",
    name: "Brienz — Meiringen",
    grc: 2 as GRCLevel,
    description: "Ländliches Alpental (GRC-2 validiert: Haslital, <50 E/km²)",
    bounds: { minLat: 46.70, maxLat: 46.77, minLng: 8.00, maxLng: 8.20 },
  },
] as const;

// ─── Gitterbasierter GRC-Lookup ───────────────────────────────────────────────

/**
 * Alle Zonen-Ebenen, von höchster zu niedrigster Priorität:
 * 1. Sonderzonen (militärisch / restricted) — immer prüfen, auch wenn GRC niedriger
 * 2. Urbane Zonen (GRC 3–5)
 * 3. Alpine GRC-2-Zonen (Hochalpentäler)
 * 4. Alpine GRC-1-Zonen (Hochgebirge / Gletscher)
 * 5. Berner Oberland Korridore (validierte Referenzkorridore)
 */
const ALL_GRC_ZONES: GRCZone[] = [
  ...RESTRICTED_ZONES,
  ...URBAN_ZONES,
  ...ALPINE_GRC2_ZONES,
  ...ALPINE_GRC1_ZONES,
  ...BERNER_OBERLAND_CORRIDORS.map((c) => ({ ...c, grc: c.grc as GRCLevel })),
];

/** Prüft, ob eine Koordinate innerhalb der Bounding-Box einer Zone liegt. */
function pointInZone(lat: number, lng: number, zone: GRCZone): boolean {
  return (
    lat >= zone.bounds.minLat &&
    lat <= zone.bounds.maxLat &&
    lng >= zone.bounds.minLng &&
    lng <= zone.bounds.maxLng
  );
}

interface PointGRCResult {
  grc: GRCLevel;
  restrictedZones: string[];
}

/**
 * Bestimmt GRC und Sonderzonen-Flags für einen einzelnen Koordinatenpunkt.
 * Prüfreihenfolge: Restricted → Urban → Alpine GRC-2 → Alpine GRC-1 → Korridore → Fallback.
 */
function getGRCForPoint(lat: number, lng: number): PointGRCResult {
  let bestGRC: GRCLevel = 3; // Konservativer Fallback (besiedelt)
  const restrictedZones: string[] = [];
  let foundMatch = false;

  for (const zone of ALL_GRC_ZONES) {
    if (!pointInZone(lat, lng, zone)) continue;

    if (zone.restricted && zone.restrictedReason) {
      restrictedZones.push(zone.restrictedReason);
    }

    // Höchste GRC gewinnt (konservativster Wert)
    if (!foundMatch || zone.grc > bestGRC) {
      bestGRC = zone.grc;
      foundMatch = true;
    }
  }

  // Fallback-Heuristik für Gebiete ausserhalb bekannter Zonen:
  // Koordinaten im Schweizer Alpenbogen (lat 45.8–46.7, übliche Alpine-Längen)
  // → GRC 2 anstatt GRC 3 (weniger konservativ als Standardfallback,
  //   aber vorsichtiger als GRC 1 ohne Bestätigung).
  if (!foundMatch) {
    const isAlpineLatitude = lat >= 45.8 && lat <= 46.75;
    const isAlpineLongitude = lng >= 6.8 && lng <= 10.5;
    if (isAlpineLatitude && isAlpineLongitude) {
      bestGRC = 2; // Unklassifiziertes Alpingebiet: dünn besiedelt
    }
  }

  return { grc: bestGRC, restrictedZones };
}

// ─── Main Assessment ──────────────────────────────────────────────────────────

export interface SoraInput {
  /** Pickup coordinates */
  pickupLng: number;
  pickupLat: number;
  /** Delivery coordinates */
  deliveryLng: number;
  deliveryLat: number;
  /** Planned flight altitude in meters AGL */
  altitudeAgl?: number;
  /** Estimated flight date (for seasonal checks) */
  flightDate?: Date;
}

export interface SoraResult {
  grc: GRCLevel;
  arc: ARCLevel;
  sail: SAILLevel;
  /** Always SPECIFIC for DJI FlyCart 100 */
  category: "SPECIFIC";
  /** BAZL/FOCA permit required */
  requiresBazlPermit: boolean;
  /** Bern-Belp CTR clearance required */
  requiresBernBelpClearance: boolean;
  /** List of risk factors for display */
  riskFactors: string[];
  /** Overall risk level */
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Recommended permits to obtain */
  recommendedPermits: PermitRequirement[];
}

export interface PermitRequirement {
  authority: string;
  type: string;
  description: string;
  isMandatory: boolean;
}

interface GRCRouteResult {
  grc: GRCLevel;
  restrictedZones: string[];
}

/**
 * Bestimmt den GRC für eine Route mittels gitterbasiertem 5-Punkte-Sampling.
 * Abtastpunkte: 0%, 25%, 50%, 75%, 100% der Strecke (Luftlinie).
 * Rückgabe: höchster GRC über alle Punkte + alle getroffenen Sonderzonen.
 *
 * Ersetzt den bisherigen manuellen Korridor-Lookup durch den umfassenden
 * Schweizer GRC-Zonenkatalog (JARUS SORA v2.5 Table 1).
 */
function calculateGRCForRoute(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number
): GRCRouteResult {
  // 5 Abtastpunkte entlang der Luftlinie (0%, 25%, 50%, 75%, 100%)
  const fractions = [0, 0.25, 0.5, 0.75, 1.0];
  let maxGRC: GRCLevel = 1;
  const allRestrictedZones: string[] = [];

  for (const t of fractions) {
    const lat = pickupLat + t * (deliveryLat - pickupLat);
    const lng = pickupLng + t * (deliveryLng - pickupLng);
    const { grc, restrictedZones } = getGRCForPoint(lat, lng);

    if (grc > maxGRC) maxGRC = grc;
    for (const reason of restrictedZones) {
      if (!allRestrictedZones.includes(reason)) {
        allRestrictedZones.push(reason);
      }
    }
  }

  return { grc: maxGRC, restrictedZones: allRestrictedZones };
}

/**
 * @deprecated Interne Hilfsfunktion — bitte calculateGRCForRoute() verwenden.
 * Bleibt für interne Kompatibilität erhalten.
 */
function calculateGRC(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number
): GRCLevel {
  return calculateGRCForRoute(pickupLng, pickupLat, deliveryLng, deliveryLat).grc;
}

/**
 * Determine ARC based on airspace characteristics.
 * Checks all major Swiss CTRs: LSZB (precise polygon), LSZH, LSGG, LFSB,
 * LSGS, LSZA, LSZL, LSMP, LSME, LSMM (bounding boxes).
 * Source: Swiss AIP AD 2 (skyguide).
 */
function calculateARC(
  pickupLng: number,
  pickupLat: number,
  deliveryLng: number,
  deliveryLat: number,
  altitudeAgl = 120
): ARCLevel {
  const inCTR = routeIntersectsControlledAirspace(pickupLng, pickupLat, deliveryLng, deliveryLat);

  if (inCTR) {
    // Inside controlled airspace
    return altitudeAgl > 500 ? "d" : "c";
  }

  // Uncontrolled airspace
  if (altitudeAgl <= 120) {
    return "a"; // Below 120m AGL, uncontrolled = ARC-a (lowest risk)
  }
  return "b"; // Above 120m but uncontrolled
}

/**
 * Run full SORA assessment for a planned flight.
 */
export function assessSora(input: SoraInput): SoraResult {
  const { pickupLng, pickupLat, deliveryLng, deliveryLat, altitudeAgl = 120 } = input;

  const { grc, restrictedZones } = calculateGRCForRoute(pickupLng, pickupLat, deliveryLng, deliveryLat);
  const arc = calculateARC(pickupLng, pickupLat, deliveryLng, deliveryLat, altitudeAgl);
  const sail = SAIL_TABLE[grc][arc];
  const requiresBernBelpClearance = requiresBernBelpPermit(
    pickupLng, pickupLat, deliveryLng, deliveryLat
  );

  // DJI FlyCart 100: MTOW 170 kg, operational limit 149.9 kg per flight.
  // At 149.9 kg, stays in SPECIFIC category (< 150 kg) — requires BAZL operator authorisation.
  const requiresBazlPermit = true;

  const riskFactors: string[] = [];

  if (grc >= 4) riskFactors.push("Dicht besiedeltes Gebiet (GRC ≥ 4)");
  if (grc >= 3) riskFactors.push("Besiedeltes Gebiet — Bodenmassnahmen erforderlich");
  if (arc === "c" || arc === "d") riskFactors.push("Kontrollierter Luftraum — CTR-Freigabe nötig");
  if (requiresBernBelpClearance) riskFactors.push("Route kreuzt Bern-Belp CTR (LSZB)");
  if (sail === "V" || sail === "VI") riskFactors.push(`SAIL ${sail} — Hohe Sicherheitsanforderungen`);
  // Sonderzone-Warnungen (militärische Schiessgebiete, Militärflugplätze)
  for (const reason of restrictedZones) {
    riskFactors.push(reason);
  }
  riskFactors.push("DJI FlyCart 100 (MTOW 170 kg, Betriebslimit 149.9 kg) — SPECIFIC Kategorie, BAZL-Betriebsgenehmigung erforderlich");

  // Overall risk
  let overallRisk: SoraResult["overallRisk"];
  if (sail === "I" || sail === "II") overallRisk = "LOW";
  else if (sail === "III" || sail === "IV") overallRisk = "MEDIUM";
  else if (sail === "V") overallRisk = "HIGH";
  else overallRisk = "CRITICAL";

  // Permit requirements
  const recommendedPermits: PermitRequirement[] = [
    {
      authority: "BAZL/FOCA",
      type: "SPECIFIC_AUTHORISATION",
      description: "Betriebsgenehmigung für SPECIFIC-Kategorie UAS (DJI FlyCart 100, MTOW 170 kg, Betriebslimit 149.9 kg)",
      isMandatory: true,
    },
  ];

  if (requiresBernBelpClearance) {
    recommendedPermits.push({
      authority: "Flughafen Bern-Belp (LSZB)",
      type: "CTR_CLEARANCE",
      description: "Luftraum-Freigabe für Flüge im CTR Bern-Belp",
      isMandatory: true,
    });
  }

  // VBS military airspace clearance when route crosses restricted zones
  // Rechtsgrundlage: Militärgesetz (MG, SR 510.10) Art. 80; LFV SR 748.132.1
  if (restrictedZones.length > 0) {
    recommendedPermits.push({
      authority: "VBS / Schweizer Armee",
      type: "MILITARY_AIRSPACE_CLEARANCE",
      description: "Militärische Luftraumfreigabe erforderlich — Route kreuzt militärisches Sperrgebiet. Koordination mit VBS und aktuelle NOTAM-Prüfung obligatorisch.",
      isMandatory: true,
    });
  }

  if (grc >= 3) {
    recommendedPermits.push({
      authority: "Gemeinde / Kanton",
      type: "MUNICIPAL_PERMIT",
      description: "Kommunale Bewilligung für Flüge über besiedeltem Gebiet",
      isMandatory: grc >= 4,
    });
  }

  return {
    grc,
    arc,
    sail,
    category: "SPECIFIC",
    requiresBazlPermit,
    requiresBernBelpClearance,
    riskFactors,
    overallRisk,
    recommendedPermits,
  };
}

/**
 * Determine the airspace risk surcharge in CHF based on SAIL level.
 * Higher SAIL = more compliance overhead = higher surcharge.
 */
export function soraAirspaceSurchargeCHF(sail: SAILLevel): number {
  const surcharges: Record<SAILLevel, number> = {
    I:   0,
    II:  25,
    III: 50,
    IV:  75,
    V:   120,
    VI:  200,
  };
  return surcharges[sail];
}

/**
 * Check if a requested time qualifies as a rush booking.
 * Rush applies when:
 * - Same-day booking (requestedDate = today)
 * - Next-day booking
 * - Time slot outside standard hours (before 08:00 or after 17:00)
 */
export function isRushBooking(
  requestedDate: string,
  requestedTimeFrom?: string,
  bookingCreatedAt?: Date,
  now?: Date
): boolean {
  const today = now ?? new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];

  if (requestedDate === todayStr || requestedDate === tomorrowStr) {
    return true;
  }

  if (requestedTimeFrom) {
    const [hours] = requestedTimeFrom.split(":").map(Number);
    if (hours < 8 || hours >= 17) {
      return true;
    }
  }

  return false;
}

/**
 * Rush surcharge in CHF.
 */
export const RUSH_SURCHARGE_CHF = 80;
