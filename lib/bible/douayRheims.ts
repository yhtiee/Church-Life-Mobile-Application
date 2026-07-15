/**
 * Douay-Rheims (Challoner) Bible — API bindings, canon table, and markup parser.
 *
 * Data source: https://thedouayrheims.com/api  (no auth, no key, no rate limit).
 * This is the traditional Catholic canon (73 books) plus the 3-book apocryphal
 * appendix (Prayer of Manasses, 3 & 4 Esdras) that the Clementine Vulgate prints.
 *
 * Endpoints used:
 *   GET /api/verse/:slug/:chapter/:verse   → single verse
 *   GET /api/chapter/:slug/:chapter        → full chapter
 *   GET /api/random?testament=OT|NT        → random verse
 *   GET /api/search?q=&scope=&limit=       → full-text search
 *
 * Verse text embeds inline markup that must be parsed, not shown raw:
 *   <na>[n]</na>  annotation marker  → resolves to notes[] entry by label
 *   <cr>[n]</cr>  cross-reference    → resolves to cross_refs[] by 1-based index
 *   <i>...</i>    italicised text
 */

export const DR_API_BASE = 'https://thedouayrheims.com';

export type Testament = 'OT' | 'NT';

export interface DouayBook {
  /** Display name (traditional Douay-Rheims English). */
  name: string;
  /** Short abbreviation for compact UI (e.g. book-list badges). */
  abbr: string;
  /** API slug used in every endpoint path. */
  slug: string;
  /** Number of chapters (verified against the API's book data). */
  chapters: number;
  testament: Testament;
  /** True for the apocryphal appendix books (not part of the canon proper). */
  appendix?: boolean;
}

/**
 * The full Douay-Rheims book table. Chapter counts were verified by fetching
 * every /data/odr/:slug.json and measuring its chapters array — do not "correct"
 * them to KJV counts; the DR canon genuinely differs (e.g. Daniel 14, Esther 16).
 */
export const DR_BOOKS: DouayBook[] = [
  // ── Old Testament ──────────────────────────────────────────────────────────
  { name: 'Genesis',              abbr: 'Gen', slug: 'genesis',                chapters: 50,  testament: 'OT' },
  { name: 'Exodus',               abbr: 'Exo', slug: 'exodus',                 chapters: 40,  testament: 'OT' },
  { name: 'Leviticus',            abbr: 'Lev', slug: 'leviticus',              chapters: 27,  testament: 'OT' },
  { name: 'Numbers',              abbr: 'Num', slug: 'numbers',                chapters: 36,  testament: 'OT' },
  { name: 'Deuteronomy',          abbr: 'Deu', slug: 'deuteronomy',            chapters: 34,  testament: 'OT' },
  { name: 'Josue',                abbr: 'Jos', slug: 'josue',                  chapters: 24,  testament: 'OT' },
  { name: 'Judges',               abbr: 'Jdg', slug: 'judges',                 chapters: 21,  testament: 'OT' },
  { name: 'Ruth',                 abbr: 'Rut', slug: 'ruth',                   chapters: 4,   testament: 'OT' },
  { name: '1 Kings',              abbr: '1Ki', slug: '1-kings',                chapters: 31,  testament: 'OT' },
  { name: '2 Kings',              abbr: '2Ki', slug: '2-kings',                chapters: 24,  testament: 'OT' },
  { name: '3 Kings',              abbr: '3Ki', slug: '3-kings',                chapters: 22,  testament: 'OT' },
  { name: '4 Kings',              abbr: '4Ki', slug: '4-kings',                chapters: 25,  testament: 'OT' },
  { name: '1 Paralipomenon',      abbr: '1Pa', slug: '1-paralipomenon',       chapters: 29,  testament: 'OT' },
  { name: '2 Paralipomenon',      abbr: '2Pa', slug: '2-paralipomenon',       chapters: 36,  testament: 'OT' },
  { name: '1 Esdras',             abbr: '1Es', slug: '1-esdras',               chapters: 10,  testament: 'OT' },
  { name: '2 Esdras (Nehemias)',  abbr: '2Es', slug: '2-esdras',              chapters: 13,  testament: 'OT' },
  { name: 'Tobias',               abbr: 'Tob', slug: 'tobias',                 chapters: 15,  testament: 'OT' },
  { name: 'Judith',               abbr: 'Jth', slug: 'judith',                 chapters: 16,  testament: 'OT' },
  { name: 'Esther',               abbr: 'Est', slug: 'esther',                 chapters: 16,  testament: 'OT' },
  { name: 'Job',                  abbr: 'Job', slug: 'job',                    chapters: 42,  testament: 'OT' },
  { name: 'Psalms',               abbr: 'Psa', slug: 'psalms',                 chapters: 150, testament: 'OT' },
  { name: 'Proverbs',             abbr: 'Pro', slug: 'proverbs',               chapters: 31,  testament: 'OT' },
  { name: 'Ecclesiastes',         abbr: 'Ecc', slug: 'ecclesiastes',          chapters: 12,  testament: 'OT' },
  { name: 'Canticle of Canticles',abbr: 'Can', slug: 'canticle-of-canticles', chapters: 8,   testament: 'OT' },
  { name: 'Wisdom',               abbr: 'Wis', slug: 'wisdom',                 chapters: 19,  testament: 'OT' },
  { name: 'Ecclesiasticus',       abbr: 'Sir', slug: 'ecclesiasticus',        chapters: 51,  testament: 'OT' },
  { name: 'Isaias',               abbr: 'Isa', slug: 'isaie',                  chapters: 66,  testament: 'OT' },
  { name: 'Jeremias',             abbr: 'Jer', slug: 'jeremie',                chapters: 52,  testament: 'OT' },
  { name: 'Lamentations',         abbr: 'Lam', slug: 'lamentations',           chapters: 5,   testament: 'OT' },
  { name: 'Baruch',               abbr: 'Bar', slug: 'baruch',                 chapters: 6,   testament: 'OT' },
  { name: 'Ezechiel',             abbr: 'Eze', slug: 'ezechiel',               chapters: 48,  testament: 'OT' },
  { name: 'Daniel',               abbr: 'Dan', slug: 'daniel',                 chapters: 14,  testament: 'OT' },
  { name: 'Osee',                 abbr: 'Ose', slug: 'osee',                   chapters: 14,  testament: 'OT' },
  { name: 'Joel',                 abbr: 'Joe', slug: 'joel',                   chapters: 3,   testament: 'OT' },
  { name: 'Amos',                 abbr: 'Amo', slug: 'amos',                   chapters: 9,   testament: 'OT' },
  { name: 'Abdias',               abbr: 'Abd', slug: 'abdias',                 chapters: 1,   testament: 'OT' },
  { name: 'Jonas',                abbr: 'Jon', slug: 'jonas',                  chapters: 4,   testament: 'OT' },
  { name: 'Micheas',              abbr: 'Mic', slug: 'micheas',                chapters: 7,   testament: 'OT' },
  { name: 'Nahum',                abbr: 'Nah', slug: 'nahum',                  chapters: 3,   testament: 'OT' },
  { name: 'Habacuc',              abbr: 'Hab', slug: 'habacuc',                chapters: 3,   testament: 'OT' },
  { name: 'Sophonias',            abbr: 'Sop', slug: 'sophonias',              chapters: 3,   testament: 'OT' },
  { name: 'Aggeus',               abbr: 'Agg', slug: 'aggeus',                 chapters: 2,   testament: 'OT' },
  { name: 'Zacharias',            abbr: 'Zac', slug: 'zacharias',              chapters: 14,  testament: 'OT' },
  { name: 'Malachias',            abbr: 'Mal', slug: 'malachie',               chapters: 4,   testament: 'OT' },
  { name: '1 Machabees',          abbr: '1Ma', slug: '1-machabees',           chapters: 16,  testament: 'OT' },
  { name: '2 Machabees',          abbr: '2Ma', slug: '2-machabees',           chapters: 15,  testament: 'OT' },
  // ── New Testament ──────────────────────────────────────────────────────────
  { name: 'Matthew',              abbr: 'Mat', slug: 'matthew',                chapters: 28,  testament: 'NT' },
  { name: 'Mark',                 abbr: 'Mar', slug: 'mark',                   chapters: 16,  testament: 'NT' },
  { name: 'Luke',                 abbr: 'Luk', slug: 'luke',                   chapters: 24,  testament: 'NT' },
  { name: 'John',                 abbr: 'Joh', slug: 'john',                   chapters: 21,  testament: 'NT' },
  { name: 'Acts',                 abbr: 'Act', slug: 'acts',                   chapters: 28,  testament: 'NT' },
  { name: 'Romans',               abbr: 'Rom', slug: 'romans',                 chapters: 16,  testament: 'NT' },
  { name: '1 Corinthians',        abbr: '1Co', slug: '1-corinthians',         chapters: 16,  testament: 'NT' },
  { name: '2 Corinthians',        abbr: '2Co', slug: '2-corinthians',         chapters: 13,  testament: 'NT' },
  { name: 'Galatians',            abbr: 'Gal', slug: 'galatians',              chapters: 6,   testament: 'NT' },
  { name: 'Ephesians',            abbr: 'Eph', slug: 'ephesians',              chapters: 6,   testament: 'NT' },
  { name: 'Philippians',          abbr: 'Phi', slug: 'philippians',            chapters: 4,   testament: 'NT' },
  { name: 'Colossians',           abbr: 'Col', slug: 'colossians',             chapters: 4,   testament: 'NT' },
  { name: '1 Thessalonians',      abbr: '1Th', slug: '1-thessalonians',       chapters: 5,   testament: 'NT' },
  { name: '2 Thessalonians',      abbr: '2Th', slug: '2-thessalonians',       chapters: 3,   testament: 'NT' },
  { name: '1 Timothy',            abbr: '1Ti', slug: '1-timothy',             chapters: 6,   testament: 'NT' },
  { name: '2 Timothy',            abbr: '2Ti', slug: '2-timothy',             chapters: 4,   testament: 'NT' },
  { name: 'Titus',                abbr: 'Tit', slug: 'titus',                  chapters: 3,   testament: 'NT' },
  { name: 'Philemon',             abbr: 'Phm', slug: 'philemon',               chapters: 1,   testament: 'NT' },
  { name: 'Hebrews',              abbr: 'Heb', slug: 'hebrews',                chapters: 13,  testament: 'NT' },
  { name: 'James',                abbr: 'Jam', slug: 'james',                  chapters: 5,   testament: 'NT' },
  { name: '1 Peter',              abbr: '1Pe', slug: '1-peter',               chapters: 5,   testament: 'NT' },
  { name: '2 Peter',              abbr: '2Pe', slug: '2-peter',               chapters: 3,   testament: 'NT' },
  { name: '1 John',               abbr: '1Jo', slug: '1-john',                chapters: 5,   testament: 'NT' },
  { name: '2 John',               abbr: '2Jo', slug: '2-john',                chapters: 1,   testament: 'NT' },
  { name: '3 John',               abbr: '3Jo', slug: '3-john',                chapters: 1,   testament: 'NT' },
  { name: 'Jude',                 abbr: 'Jud', slug: 'jude',                   chapters: 1,   testament: 'NT' },
  { name: 'Apocalypse',           abbr: 'Apo', slug: 'apocalypse',             chapters: 22,  testament: 'NT' },
  // ── Apocryphal appendix (Clementine Vulgate) ────────────────────────────────
  { name: 'Prayer of Manasses',   abbr: 'PrM', slug: 'prayer-of-manasses',    chapters: 1,   testament: 'OT', appendix: true },
  { name: '3 Esdras',             abbr: '3Es', slug: '3-esdras',               chapters: 9,   testament: 'OT', appendix: true },
  { name: '4 Esdras',             abbr: '4Es', slug: '4-esdras',               chapters: 16,  testament: 'OT', appendix: true },
];

export const findBookBySlug = (slug: string): DouayBook | undefined =>
  DR_BOOKS.find((b) => b.slug === slug);

export const findBookByName = (name: string): DouayBook | undefined => {
  const n = name.trim().toLowerCase();
  return DR_BOOKS.find(
    (b) => b.name.toLowerCase() === n || b.name.toLowerCase().startsWith(n + ' ('),
  );
};

// ── Markup parsing ─────────────────────────────────────────────────────────────

/** A footnote or cross-reference attached to a verse. */
export interface Note {
  /** Marker label as printed in the text (e.g. "1"), or the index for cross-refs. */
  label: string;
  text: string;
  kind: 'annotation' | 'crossref';
}

/** A run of parsed verse text: plain, italic, or a tappable marker. */
export type ScriptureSegment =
  | { type: 'text'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'marker'; label: string; note: Note };

const MARKUP_RE = /<na>\[(\d+)\]<\/na>|<cr>\[(\d+)\]<\/cr>|<i>([\s\S]*?)<\/i>/g;

/** Remove every tag, returning clean prose. Safe for previews and list rows. */
export function stripMarkup(text: string): string {
  return (text ?? '')
    .replace(/<na>\[\d+\]<\/na>/g, '')
    .replace(/<cr>\[\d+\]<\/cr>/g, '')
    .replace(/<\/?i>/g, '')
    .replace(/<[^>]+>/g, '') // any stray tags
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Normalise the `notes` / `cross_refs` fields, which arrive in two shapes:
 *  - verse/chapter endpoints: notes = [{label, text}], cross_refs = [{text}]
 *  - search endpoint: notes = ["label=..; text=.."]-ish PS strings (unused here)
 */
function normaliseNotes(raw: any[]): { label: string; text: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((n) => {
      if (n && typeof n === 'object') return { label: String(n.label ?? ''), text: String(n.text ?? '') };
      return { label: '', text: String(n ?? '') };
    })
    .filter((n) => n.text);
}

function normaliseCrossRefs(raw: any[]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => (c && typeof c === 'object' ? String(c.text ?? '') : String(c ?? '')))
    .filter(Boolean);
}

/**
 * Parse raw verse text + its notes/cross_refs into renderable segments plus the
 * flat, de-duplicated list of notes referenced by that verse.
 */
export function parseScripture(
  rawText: string,
  rawNotes: any[] = [],
  rawCrossRefs: any[] = [],
): { segments: ScriptureSegment[]; notes: Note[] } {
  const notes = normaliseNotes(rawNotes);
  const crossRefs = normaliseCrossRefs(rawCrossRefs);
  const segments: ScriptureSegment[] = [];
  const usedNotes: Note[] = [];

  const pushNote = (note: Note) => {
    if (!usedNotes.some((n) => n.kind === note.kind && n.label === note.label)) {
      usedNotes.push(note);
    }
  };

  const text = rawText ?? '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MARKUP_RE.lastIndex = 0;

  while ((match = MARKUP_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    const [, naLabel, crLabel, italic] = match;

    if (naLabel !== undefined) {
      const found = notes.find((n) => n.label === naLabel);
      const note: Note = { label: naLabel, kind: 'annotation', text: found?.text ?? '' };
      pushNote(note);
      segments.push({ type: 'marker', label: naLabel, note });
    } else if (crLabel !== undefined) {
      const idx = parseInt(crLabel, 10) - 1;
      const note: Note = { label: crLabel, kind: 'crossref', text: crossRefs[idx] ?? '' };
      pushNote(note);
      segments.push({ type: 'marker', label: '✝', note });
    } else if (italic !== undefined) {
      // Italic text may itself contain markers; strip them for the italic run.
      segments.push({ type: 'italic', text: stripMarkup(italic) });
    }
    lastIndex = MARKUP_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return { segments, notes: usedNotes };
}

/**
 * Build render segments from raw text + an ALREADY-RESOLVED note list (the shape
 * `parseScripture` returns). Used by <ScriptureText />, which is handed the notes
 * the service already parsed rather than the raw API payload.
 */
export function segmentsFromNotes(rawText: string, notes: Note[] = []): ScriptureSegment[] {
  const segments: ScriptureSegment[] = [];
  const text = rawText ?? '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MARKUP_RE.lastIndex = 0;

  const findNote = (kind: Note['kind'], label: string): Note =>
    notes.find((n) => n.kind === kind && n.label === label) ?? { kind, label, text: '' };

  while ((match = MARKUP_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    const [, naLabel, crLabel, italic] = match;
    if (naLabel !== undefined) {
      segments.push({ type: 'marker', label: naLabel, note: findNote('annotation', naLabel) });
    } else if (crLabel !== undefined) {
      segments.push({ type: 'marker', label: '✝', note: findNote('crossref', crLabel) });
    } else if (italic !== undefined) {
      segments.push({ type: 'italic', text: stripMarkup(italic) });
    }
    lastIndex = MARKUP_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex) });
  }
  return segments;
}
