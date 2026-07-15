/**
 * BibleService — Douay-Rheims (Challoner) scripture provider.
 *
 * Backed by https://thedouayrheims.com/api (Catholic canon, no auth/key).
 * The canon table, markup parser, and endpoint constants live in
 * `lib/bible/douayRheims.ts`; this class is the app-facing façade.
 *
 * IMPORTANT: `BibleVerse.text` is always the CLEAN (markup-stripped) verse so
 * preview surfaces (home screen, cards) stay safe. Screens that want footnotes
 * read `rawText` + `notes` and render them via <ScriptureText />.
 */
import {
  DR_API_BASE,
  DR_BOOKS,
  findBookByName,
  findBookBySlug,
  parseScripture,
  stripMarkup,
  type DouayBook,
  type Note,
  type Testament,
} from '@/lib/bible/douayRheims';

export interface BibleVerse {
  reference: string;
  /** Clean, markup-free verse text — safe for previews and cards. */
  text: string;
  /** Original verse text with <na>/<cr>/<i> markup, for footnote rendering. */
  rawText: string;
  book: string;
  chapter: number;
  verse: number;
  /** Footnotes and cross-references referenced by this verse. */
  notes: Note[];
}

/** A single verse inside a chapter reader. */
export interface ChapterVerse {
  verse: number;
  text: string;      // clean
  rawText: string;   // with markup
  notes: Note[];
}

async function fetchJson(url: string): Promise<any | null> {
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Bible API error:', res.status, url);
    return null;
  }
  const body = await res.text();
  if (body.trim().startsWith('<')) return null; // HTML error page
  return JSON.parse(body);
}

/** Build a BibleVerse from a raw /api/verse or /api/random payload. */
function toBibleVerse(data: any): BibleVerse | null {
  if (!data || typeof data.verse !== 'number') return null;
  const book = findBookBySlug(data.book);
  const name = book?.name ?? data.book;
  const rawText = String(data.text ?? '');
  const { notes } = parseScripture(rawText, data.notes, data.cross_refs);
  return {
    reference: `${name} ${data.chapter}:${data.verse}`,
    text: stripMarkup(rawText),
    rawText,
    book: name,
    chapter: data.chapter,
    verse: data.verse,
    notes,
  };
}

export class BibleService {
  /**
   * Verse of the day — deterministic per calendar day, stable within the day.
   */
  async getVerseOfDay(): Promise<BibleVerse | null> {
    try {
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
      );

      // Only draw daily verses from the canonical books (skip the appendix).
      const canon = DR_BOOKS.filter((b) => !b.appendix);
      const book = canon[dayOfYear % canon.length];
      const chapter = (Math.floor(dayOfYear / canon.length) % book.chapters) + 1;
      const verse = (dayOfYear % 10) + 1;

      return await this.getVerse(book.slug, chapter, verse);
    } catch (err) {
      console.error('Error getting verse of day:', err);
      return null;
    }
  }

  /**
   * Fetch one verse by book slug, chapter and verse. Falls back to the first
   * verse of the chapter if the requested verse is out of range.
   */
  async getVerse(slug: string, chapter: number, verse: number): Promise<BibleVerse | null> {
    try {
      const direct = await fetchJson(`${DR_API_BASE}/api/verse/${slug}/${chapter}/${verse}`);
      const built = toBibleVerse(direct);
      if (built) return built;

      // Requested verse missing → fall back to verse 1 of the chapter.
      if (verse !== 1) return this.getVerse(slug, chapter, 1);
      return null;
    } catch (err) {
      console.error('Exception fetching verse:', err);
      return null;
    }
  }

  /** Fetch a full chapter as a list of parsed verses. */
  async getChapter(slug: string, chapter: number): Promise<ChapterVerse[] | null> {
    try {
      const data = await fetchJson(`${DR_API_BASE}/api/chapter/${slug}/${chapter}`);
      const verses: any[] = Array.isArray(data?.verses) ? data.verses : [];
      if (verses.length === 0) return null;

      return verses.map((v: any) => {
        const rawText = String(v.text ?? '');
        const { notes } = parseScripture(rawText, v.notes, v.cross_refs);
        return {
          verse: v.verse,
          text: stripMarkup(rawText),
          rawText,
          notes,
        };
      });
    } catch (err) {
      console.error('Exception fetching chapter:', err);
      return null;
    }
  }

  /** Random verse, optionally restricted to one Testament. */
  async getRandomVerse(testament?: Testament): Promise<BibleVerse | null> {
    try {
      const qs = testament ? `?testament=${testament}` : '';
      const data = await fetchJson(`${DR_API_BASE}/api/random${qs}`);
      return toBibleVerse(data);
    } catch (err) {
      console.error('Error getting random verse:', err);
      return null;
    }
  }

  /** Resolve a reference like "John 3:16" or "1 Corinthians 13:4". */
  async getVerseByReference(reference: string): Promise<BibleVerse | null> {
    try {
      const parts = reference.trim().split(' ');
      let chapterVerseIdx = -1;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes(':')) {
          chapterVerseIdx = i;
          break;
        }
      }
      if (chapterVerseIdx === -1) return null;

      const bookName = parts.slice(0, chapterVerseIdx).join(' ');
      const [chapterStr, verseStr] = parts[chapterVerseIdx].split(':');
      const chapter = parseInt(chapterStr, 10);
      const verse = parseInt(verseStr, 10);

      const book: DouayBook | undefined = findBookByName(bookName);
      if (!book) {
        console.warn('Book not found:', bookName);
        return null;
      }
      return await this.getVerse(book.slug, chapter, verse);
    } catch (err) {
      console.error('Error parsing reference:', err);
      return null;
    }
  }

  /**
   * Full-text search across verse text.
   * @returns lightweight hits with clean text and a resolved reference.
   */
  async search(
    query: string,
    limit = 50,
  ): Promise<{ reference: string; text: string; slug: string; chapter: number; verse: number }[]> {
    try {
      const q = encodeURIComponent(query.trim());
      if (!q) return [];
      const data = await fetchJson(`${DR_API_BASE}/api/search?q=${q}&scope=verses&limit=${limit}`);
      const results: any[] = Array.isArray(data?.results) ? data.results : [];

      const hits: { reference: string; text: string; slug: string; chapter: number; verse: number }[] = [];
      for (const r of results) {
        const book = findBookBySlug(r.slug);
        const name = book?.name ?? r.bookName ?? r.slug;
        for (const v of r.verses ?? []) {
          hits.push({
            reference: `${name} ${r.chapter}:${v.verse}`,
            text: stripMarkup(String(v.text ?? '')),
            slug: r.slug,
            chapter: r.chapter,
            verse: v.verse,
          });
        }
      }
      return hits;
    } catch (err) {
      console.error('Error searching scripture:', err);
      return [];
    }
  }
}
