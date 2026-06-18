export interface BibleVerse {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
}

// Bible books with IDs matching the API
const BIBLE_BOOKS = [
  { name: 'Genesis', id: 'GEN', testament: 'OT', chapters: 50 },
  { name: 'Exodus', id: 'EXO', testament: 'OT', chapters: 40 },
  { name: 'Leviticus', id: 'LEV', testament: 'OT', chapters: 27 },
  { name: 'Numbers', id: 'NUM', testament: 'OT', chapters: 36 },
  { name: 'Deuteronomy', id: 'DEU', testament: 'OT', chapters: 34 },
  { name: 'Joshua', id: 'JOS', testament: 'OT', chapters: 24 },
  { name: 'Judges', id: 'JDG', testament: 'OT', chapters: 21 },
  { name: 'Ruth', id: 'RUT', testament: 'OT', chapters: 4 },
  { name: '1 Samuel', id: '1SA', testament: 'OT', chapters: 31 },
  { name: '2 Samuel', id: '2SA', testament: 'OT', chapters: 24 },
  { name: 'Psalms', id: 'PSA', testament: 'OT', chapters: 150 },
  { name: 'Proverbs', id: 'PRO', testament: 'OT', chapters: 31 },
  { name: 'Isaiah', id: 'ISA', testament: 'OT', chapters: 66 },
  { name: 'Jeremiah', id: 'JER', testament: 'OT', chapters: 52 },
  { name: 'Matthew', id: 'MAT', testament: 'NT', chapters: 28 },
  { name: 'Mark', id: 'MRK', testament: 'NT', chapters: 16 },
  { name: 'Luke', id: 'LUK', testament: 'NT', chapters: 24 },
  { name: 'John', id: 'JHN', testament: 'NT', chapters: 21 },
  { name: 'Romans', id: 'ROM', testament: 'NT', chapters: 16 },
  { name: '1 Corinthians', id: '1CO', testament: 'NT', chapters: 16 },
  { name: 'Galatians', id: 'GAL', testament: 'NT', chapters: 6 },
  { name: 'Ephesians', id: 'EPH', testament: 'NT', chapters: 6 },
  { name: 'Philippians', id: 'PHP', testament: 'NT', chapters: 4 },
  { name: 'Colossians', id: 'COL', testament: 'NT', chapters: 4 },
  { name: '1 Thessalonians', id: '1TH', testament: 'NT', chapters: 5 },
  { name: '1 Timothy', id: '1TI', testament: 'NT', chapters: 6 },
  { name: 'Hebrews', id: 'HEB', testament: 'NT', chapters: 13 },
  { name: 'James', id: 'JAS', testament: 'NT', chapters: 5 },
  { name: '1 Peter', id: '1PE', testament: 'NT', chapters: 5 },
  { name: '1 John', id: '1JN', testament: 'NT', chapters: 5 },
  { name: 'Revelation', id: 'REV', testament: 'NT', chapters: 22 },
];

export class BibleService {
  /**
   * Get verse of the day from Bible API
   * Ensures same verse throughout the day, different verse each day
   */
  async getVerseOfDay(): Promise<BibleVerse | null> {
    try {
      // Generate deterministic book and chapter for today
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
      );

      // Pick a book based on day of year
      const bookIndex = dayOfYear % BIBLE_BOOKS.length;
      const book = BIBLE_BOOKS[bookIndex];

      // Pick a chapter in that book
      const chapterIndex = Math.floor((dayOfYear / BIBLE_BOOKS.length) % book.chapters) + 1;

      // Pick a verse in that chapter (usually first few verses, or random within chapter)
      const verse = (dayOfYear % 10) + 1; // Verses 1-10 variation

      return await this.getVerse(book.id, chapterIndex, verse);
    } catch (err) {
      console.error('Error getting verse of day:', err);
      return null;
    }
  }

  /**
   * Fetch a specific verse from Bible API
   */
  async getVerse(
    bookId: string,
    chapter: number,
    verse: number
  ): Promise<BibleVerse | null> {
    try {
      // Fetch the entire chapter
      const url = `https://bible-api.com/data/kjv/${bookId}/${chapter}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error('Failed to fetch chapter:', res.status);
        return null;
      }

      const text = await res.text();
      if (text.trim().startsWith('<')) {
        // HTML response means error
        return null;
      }

      const data = JSON.parse(text);
      const verseList: any[] = Array.isArray(data) ? data : (data.verses ?? []);

      // Find the specific verse
      const verseData = verseList.find((v: any) => v.verse === verse);
      if (!verseData) {
        // If specific verse not found, get first verse of chapter
        if (verseList.length > 0) {
          const firstVerse = verseList[0];
          const book = BIBLE_BOOKS.find((b) => b.id === bookId);
          return {
            reference: `${book?.name} ${chapter}:${firstVerse.verse}`,
            text: (firstVerse.text ?? '').trim(),
            book: book?.name ?? bookId,
            chapter,
            verse: firstVerse.verse,
          };
        }
        return null;
      }

      const book = BIBLE_BOOKS.find((b) => b.id === bookId);
      return {
        reference: `${book?.name} ${chapter}:${verse}`,
        text: (verseData.text ?? '').trim(),
        book: book?.name ?? bookId,
        chapter,
        verse,
      };
    } catch (err) {
      console.error('Exception fetching verse:', err);
      return null;
    }
  }

  /**
   * Get a random verse from any book
   */
  async getRandomVerse(): Promise<BibleVerse | null> {
    try {
      const randomBook = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
      const randomVerse = Math.floor(Math.random() * 10) + 1;

      return await this.getVerse(randomBook.id, randomChapter, randomVerse);
    } catch (err) {
      console.error('Error getting random verse:', err);
      return null;
    }
  }

  /**
   * Get verse by reference (e.g., "John 3:16")
   */
  async getVerseByReference(reference: string): Promise<BibleVerse | null> {
    try {
      // Parse reference format: "BookName Chapter:Verse"
      const parts = reference.split(' ');
      let bookName = '';
      let chapterVerse = '';

      // Handle books with multiple words (e.g., "1 John", "Song of Solomon")
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes(':')) {
          bookName = parts.slice(0, i).join(' ');
          chapterVerse = parts[i];
          break;
        }
      }

      const [chapterStr, verseStr] = chapterVerse.split(':');
      const chapter = parseInt(chapterStr, 10);
      const verse = parseInt(verseStr, 10);

      const book = BIBLE_BOOKS.find((b) =>
        b.name.toLowerCase() === bookName.toLowerCase()
      );

      if (!book) {
        console.warn('Book not found:', bookName);
        return null;
      }

      return await this.getVerse(book.id, chapter, verse);
    } catch (err) {
      console.error('Error parsing reference:', err);
      return null;
    }
  }
}
