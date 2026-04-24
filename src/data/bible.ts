// A curated micro-corpus for the v1 reading experience. Each chapter carries
// real ESV-style text for select chapters; others fall back to a short excerpt.
// This keeps the bundle small while letting Clavis demonstrate depth.

export interface Verse {
  n: number;
  text: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

export const BOOKS = [
  // Old Testament — Pentateuch
  { name: "Genesis", chapters: 50, testament: "OT", group: "Pentateuch" },
  { name: "Exodus", chapters: 40, testament: "OT", group: "Pentateuch" },
  { name: "Leviticus", chapters: 27, testament: "OT", group: "Pentateuch" },
  { name: "Numbers", chapters: 36, testament: "OT", group: "Pentateuch" },
  { name: "Deuteronomy", chapters: 34, testament: "OT", group: "Pentateuch" },
  // Historical
  { name: "Joshua", chapters: 24, testament: "OT", group: "Historical" },
  { name: "Judges", chapters: 21, testament: "OT", group: "Historical" },
  { name: "Ruth", chapters: 4, testament: "OT", group: "Historical" },
  { name: "1 Samuel", chapters: 31, testament: "OT", group: "Historical" },
  { name: "2 Samuel", chapters: 24, testament: "OT", group: "Historical" },
  { name: "1 Kings", chapters: 22, testament: "OT", group: "Historical" },
  { name: "2 Kings", chapters: 25, testament: "OT", group: "Historical" },
  { name: "1 Chronicles", chapters: 29, testament: "OT", group: "Historical" },
  { name: "2 Chronicles", chapters: 36, testament: "OT", group: "Historical" },
  { name: "Ezra", chapters: 10, testament: "OT", group: "Historical" },
  { name: "Nehemiah", chapters: 13, testament: "OT", group: "Historical" },
  { name: "Esther", chapters: 10, testament: "OT", group: "Historical" },
  // Wisdom
  { name: "Job", chapters: 42, testament: "OT", group: "Wisdom" },
  { name: "Psalms", chapters: 150, testament: "OT", group: "Wisdom" },
  { name: "Proverbs", chapters: 31, testament: "OT", group: "Wisdom" },
  { name: "Ecclesiastes", chapters: 12, testament: "OT", group: "Wisdom" },
  { name: "Song of Solomon", chapters: 8, testament: "OT", group: "Wisdom" },
  // Major Prophets
  { name: "Isaiah", chapters: 66, testament: "OT", group: "Major Prophets" },
  { name: "Jeremiah", chapters: 52, testament: "OT", group: "Major Prophets" },
  { name: "Lamentations", chapters: 5, testament: "OT", group: "Major Prophets" },
  { name: "Ezekiel", chapters: 48, testament: "OT", group: "Major Prophets" },
  { name: "Daniel", chapters: 12, testament: "OT", group: "Major Prophets" },
  // Minor Prophets
  { name: "Hosea", chapters: 14, testament: "OT", group: "Minor Prophets" },
  { name: "Joel", chapters: 3, testament: "OT", group: "Minor Prophets" },
  { name: "Amos", chapters: 9, testament: "OT", group: "Minor Prophets" },
  { name: "Obadiah", chapters: 1, testament: "OT", group: "Minor Prophets" },
  { name: "Jonah", chapters: 4, testament: "OT", group: "Minor Prophets" },
  { name: "Micah", chapters: 7, testament: "OT", group: "Minor Prophets" },
  { name: "Nahum", chapters: 3, testament: "OT", group: "Minor Prophets" },
  { name: "Habakkuk", chapters: 3, testament: "OT", group: "Minor Prophets" },
  { name: "Zephaniah", chapters: 3, testament: "OT", group: "Minor Prophets" },
  { name: "Haggai", chapters: 2, testament: "OT", group: "Minor Prophets" },
  { name: "Zechariah", chapters: 14, testament: "OT", group: "Minor Prophets" },
  { name: "Malachi", chapters: 4, testament: "OT", group: "Minor Prophets" },
  // Gospels & Acts
  { name: "Matthew", chapters: 28, testament: "NT", group: "Gospels & Acts" },
  { name: "Mark", chapters: 16, testament: "NT", group: "Gospels & Acts" },
  { name: "Luke", chapters: 24, testament: "NT", group: "Gospels & Acts" },
  { name: "John", chapters: 21, testament: "NT", group: "Gospels & Acts" },
  { name: "Acts", chapters: 28, testament: "NT", group: "Gospels & Acts" },
  // Pauline Epistles
  { name: "Romans", chapters: 16, testament: "NT", group: "Pauline Epistles" },
  { name: "1 Corinthians", chapters: 16, testament: "NT", group: "Pauline Epistles" },
  { name: "2 Corinthians", chapters: 13, testament: "NT", group: "Pauline Epistles" },
  { name: "Galatians", chapters: 6, testament: "NT", group: "Pauline Epistles" },
  { name: "Ephesians", chapters: 6, testament: "NT", group: "Pauline Epistles" },
  { name: "Philippians", chapters: 4, testament: "NT", group: "Pauline Epistles" },
  { name: "Colossians", chapters: 4, testament: "NT", group: "Pauline Epistles" },
  { name: "1 Thessalonians", chapters: 5, testament: "NT", group: "Pauline Epistles" },
  { name: "2 Thessalonians", chapters: 3, testament: "NT", group: "Pauline Epistles" },
  { name: "1 Timothy", chapters: 6, testament: "NT", group: "Pauline Epistles" },
  { name: "2 Timothy", chapters: 4, testament: "NT", group: "Pauline Epistles" },
  { name: "Titus", chapters: 3, testament: "NT", group: "Pauline Epistles" },
  { name: "Philemon", chapters: 1, testament: "NT", group: "Pauline Epistles" },
  // General Epistles
  { name: "Hebrews", chapters: 13, testament: "NT", group: "General Epistles" },
  { name: "James", chapters: 5, testament: "NT", group: "General Epistles" },
  { name: "1 Peter", chapters: 5, testament: "NT", group: "General Epistles" },
  { name: "2 Peter", chapters: 3, testament: "NT", group: "General Epistles" },
  { name: "1 John", chapters: 5, testament: "NT", group: "General Epistles" },
  { name: "2 John", chapters: 1, testament: "NT", group: "General Epistles" },
  { name: "3 John", chapters: 1, testament: "NT", group: "General Epistles" },
  { name: "Jude", chapters: 1, testament: "NT", group: "General Epistles" },
  // Apocalyptic
  { name: "Revelation", chapters: 22, testament: "NT", group: "Apocalyptic" },
] as const;

const CHAPTERS: Record<string, Chapter> = {
  "John 1": {
    book: "John",
    chapter: 1,
    verses: [
      { n: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { n: 2, text: "He was in the beginning with God." },
      { n: 3, text: "All things were made through him, and without him was not any thing made that was made." },
      { n: 4, text: "In him was life, and the life was the light of men." },
      { n: 5, text: "The light shines in the darkness, and the darkness has not overcome it." },
      { n: 6, text: "There was a man sent from God, whose name was John." },
      { n: 7, text: "He came as a witness, to bear witness about the light, that all might believe through him." },
      { n: 8, text: "He was not the light, but came to bear witness about the light." },
      { n: 9, text: "The true light, which gives light to everyone, was coming into the world." },
      { n: 10, text: "He was in the world, and the world was made through him, yet the world did not know him." },
      { n: 11, text: "He came to his own, and his own people did not receive him." },
      { n: 12, text: "But to all who did receive him, who believed in his name, he gave the right to become children of God," },
      { n: 13, text: "who were born, not of blood nor of the will of the flesh nor of the will of man, but of God." },
      { n: 14, text: "And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth." },
    ],
  },
  "John 3": {
    book: "John",
    chapter: 3,
    verses: [
      { n: 16, text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
      { n: 17, text: "For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him." },
    ],
  },
  "Romans 8": {
    book: "Romans",
    chapter: 8,
    verses: [
      { n: 1, text: "There is therefore now no condemnation for those who are in Christ Jesus." },
      { n: 2, text: "For the law of the Spirit of life has set you free in Christ Jesus from the law of sin and death." },
      { n: 3, text: "For God has done what the law, weakened by the flesh, could not do. By sending his own Son in the likeness of sinful flesh and for sin, he condemned sin in the flesh," },
      { n: 4, text: "in order that the righteous requirement of the law might be fulfilled in us, who walk not according to the flesh but according to the Spirit." },
      { n: 28, text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
      { n: 31, text: "What then shall we say to these things? If God is for us, who can be against us?" },
      { n: 35, text: "Who shall separate us from the love of Christ? Shall tribulation, or distress, or persecution, or famine, or nakedness, or danger, or sword?" },
      { n: 38, text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers," },
      { n: 39, text: "nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord." },
    ],
  },
  "Psalms 23": {
    book: "Psalms",
    chapter: 23,
    verses: [
      { n: 1, text: "The LORD is my shepherd; I shall not want." },
      { n: 2, text: "He makes me lie down in green pastures. He leads me beside still waters." },
      { n: 3, text: "He restores my soul. He leads me in paths of righteousness for his name's sake." },
      { n: 4, text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
      { n: 5, text: "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows." },
      { n: 6, text: "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever." },
    ],
  },
  "Genesis 1": {
    book: "Genesis",
    chapter: 1,
    verses: [
      { n: 1, text: "In the beginning, God created the heavens and the earth." },
      { n: 2, text: "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters." },
      { n: 3, text: "And God said, \"Let there be light,\" and there was light." },
      { n: 4, text: "And God saw that the light was good. And God separated the light from the darkness." },
      { n: 5, text: "God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day." },
    ],
  },
  "Philippians 4": {
    book: "Philippians",
    chapter: 4,
    verses: [
      { n: 6, text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
      { n: 7, text: "And the peace of God, which surpasses all understanding, will guard your hearts and minds in Christ Jesus." },
      { n: 8, text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things." },
      { n: 13, text: "I can do all things through him who strengthens me." },
    ],
  },
};

export function getChapter(book: string, chapter: number): Chapter {
  const key = `${book} ${chapter}`;
  if (CHAPTERS[key]) return CHAPTERS[key];
  return {
    book,
    chapter,
    verses: [
      {
        n: 1,
        text: `This chapter (${book} ${chapter}) is part of Aperio's expanding library. Tap "Open Clavis" to explore the historical, theological, and linguistic depth of this passage while the full text is being added.`,
      },
    ],
  };
}

export const SCRIPTURE_OF_DAY = {
  ref: "Philippians 4:6-7",
  text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and minds in Christ Jesus.",
  translation: "ESV",
};