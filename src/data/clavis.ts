import type { ClavisTone } from "@/lib/aperio-store";

export interface LexiconEntry {
  word: string;
  original: string;
  language: "Greek" | "Hebrew";
  strongs: string;
  translit: string;
  definition: string;
  usage: string;
  occurrences: number;
}

export interface CrossRef {
  ref: string;
  text: string;
  why: string;
}

export interface ClavisCommentary {
  overview: string;
  theology: string;
  context: string;
  application: string;
  lexicon: LexiconEntry[];
  crossRefs: CrossRef[];
  manuscript: {
    tradition: string;
    variants: string;
    transmission: string;
  };
}

const FALLBACK: ClavisCommentary = {
  overview:
    "This passage sits within a larger movement of the biblical narrative. Clavis is preparing a full commentary for this chapter; in the meantime, the lexicon and cross-reference engines are fully active for any verse you tap.",
  theology:
    "Every passage of Scripture participates in the unfolding revelation of God's covenant faithfulness. Watch for recurring themes of creation, exile, covenant, and redemption.",
  context:
    "Consider the original audience: who they were, what they were facing, and what this text would have meant before it ever crossed centuries to reach you.",
  application:
    "Read slowly. Let one phrase rest with you longer than the others. The Word is alive — it will meet you where you actually are.",
  lexicon: [
    {
      word: "word",
      original: "λόγος",
      language: "Greek",
      strongs: "G3056",
      translit: "logos",
      definition: "A word, an account, the divine self-expression. In John, the eternal Son.",
      usage: "Used 330 times in the NT — but supremely in John 1 of Christ himself.",
      occurrences: 330,
    },
  ],
  crossRefs: [
    {
      ref: "Hebrews 1:1-3",
      text: "...in these last days he has spoken to us by his Son...",
      why: "Echoes the same theology of God revealing himself supremely through the Son.",
    },
  ],
  manuscript: {
    tradition: "Drawn primarily from the Nestle-Aland 28 / UBS5 critical text.",
    variants: "No significant variants affect the meaning of this passage.",
    transmission: "Attested in the earliest papyri and uncials.",
  },
};

const COMMENTARIES: Record<string, ClavisCommentary> = {
  "John 1": {
    overview:
      "John opens his Gospel not at a manger, but at the dawn of all things. He deliberately echoes Genesis 1:1 — 'In the beginning' — and reveals that the eternal Logos who spoke creation into being has now stepped into it as flesh. The prologue (vv. 1–18) is the theological skeleton on which the rest of the Gospel hangs.",
    theology:
      "John establishes the full deity and full humanity of Christ in fourteen verses. The Word IS God (v.1) and the Word BECAME flesh (v.14). This is the doctrine the Council of Chalcedon (AD 451) would later codify: one person, two natures, without confusion or division.",
    context:
      "Written likely from Ephesus around AD 85–95, John writes to a community already wrestling with proto-Gnostic teaching that denied Jesus had truly come in the flesh. By marrying the Greek philosophical concept of Logos to Hebrew creation theology, John builds a bridge no early heresy could cross.",
    application:
      "If the Word entered the darkness and the darkness has not overcome it, then no darkness in your life is the final word. The light that spoke galaxies into being still shines — and it shines, specifically, on you.",
    lexicon: [
      {
        word: "Word",
        original: "λόγος",
        language: "Greek",
        strongs: "G3056",
        translit: "logos",
        definition:
          "A word, reasoned discourse, the divine self-expression. For John, the eternal Son who is God's perfect communication of himself.",
        usage:
          "John takes a term beloved by both Hebrew wisdom literature (the dabar of YHWH) and Greek philosophy (the rational principle ordering the cosmos) and reveals that this Logos is a person — Jesus.",
        occurrences: 330,
      },
      {
        word: "life",
        original: "ζωή",
        language: "Greek",
        strongs: "G2222",
        translit: "zōē",
        definition: "Life — not mere biological existence (bios) but the divine, qualitative life of God himself.",
        usage: "John uses zōē 36 times. It is one of his signature words for what Christ gives.",
        occurrences: 135,
      },
      {
        word: "light",
        original: "φῶς",
        language: "Greek",
        strongs: "G5457",
        translit: "phōs",
        definition: "Light — physical, moral, and revelatory. In John, often the self-disclosure of God in Christ.",
        usage: "Paired throughout John with darkness (skotia) as a primary image of the cosmic conflict.",
        occurrences: 73,
      },
      {
        word: "dwelt",
        original: "ἐσκήνωσεν",
        language: "Greek",
        strongs: "G4637",
        translit: "eskēnōsen",
        definition: "Literally, 'tabernacled' — pitched his tent.",
        usage:
          "A direct allusion to Exodus 40 — God's glory filling the tabernacle. John says: that glory now dwells in a body.",
        occurrences: 5,
      },
    ],
    crossRefs: [
      { ref: "Genesis 1:1", text: "In the beginning, God created the heavens and the earth.", why: "John deliberately echoes the opening of the Hebrew Bible." },
      { ref: "Colossians 1:15-17", text: "He is the image of the invisible God... all things were created through him and for him.", why: "Paul develops the same cosmic Christology: Christ as agent of creation." },
      { ref: "Hebrews 1:1-3", text: "...in these last days he has spoken to us by his Son...", why: "Hebrews opens with the same Logos theology." },
      { ref: "Exodus 40:34-35", text: "Then the cloud covered the tent of meeting, and the glory of the LORD filled the tabernacle.", why: "The verb 'dwelt' (eskēnōsen) in v.14 deliberately recalls this scene." },
    ],
    manuscript: {
      tradition: "Critical text (NA28/UBS5). The Prologue is exceptionally well-attested across Alexandrian and Western traditions.",
      variants: "v.18: 'only God' (μονογενὴς θεός — 𝔓66, 𝔓75, ℵ, B) vs. 'only Son' (μονογενὴς υἱός — A, later mss). The earliest reading is theologically strongest.",
      transmission: "Present in 𝔓66 (c. AD 200) and 𝔓75 (c. AD 175–225) — among the earliest NT manuscripts in existence.",
    },
  },
  "Romans 8": {
    overview:
      "Romans 8 is the Mount Everest of the New Testament. Paul moves from 'no condemnation' (v.1) to 'no separation' (v.39) — a single arc tracing what it means to live in the Spirit. Every promise rests on the work already accomplished by Christ.",
    theology:
      "Paul establishes that justification (Romans 3–5) leads inevitably to sanctification (Romans 6–7) and ultimately to glorification (Romans 8). The Spirit is the down payment of the inheritance still to come.",
    context:
      "Written from Corinth around AD 57 to a mixed Jew-Gentile congregation Paul had not yet visited. The Roman Christians were navigating real suffering under Nero's empire — Paul's words about tribulation and sword were not abstract.",
    application:
      "If God is for you, the math of opposition no longer matters. Whatever you are walking through today — Paul has already named it (v.35) and answered it (v.37): 'in all these things we are more than conquerors.'",
    lexicon: [
      {
        word: "condemnation",
        original: "κατάκριμα",
        language: "Greek",
        strongs: "G2631",
        translit: "katakrima",
        definition: "A judicial sentence of condemnation — the verdict, not just the feeling.",
        usage: "Paul uses katakrima three times in Romans (5:16, 5:18, 8:1) — always to contrast Adam's sentence with Christ's acquittal.",
        occurrences: 3,
      },
      {
        word: "love",
        original: "ἀγάπη",
        language: "Greek",
        strongs: "G26",
        translit: "agapē",
        definition: "Self-giving, covenantal love — chosen, not felt. Distinct from phileo (friendship) and eros (desire).",
        usage: "Used 116 times in the NT. In Romans 8 it bookends the chapter (v.28 and v.39).",
        occurrences: 116,
      },
      {
        word: "Spirit",
        original: "πνεῦμα",
        language: "Greek",
        strongs: "G4151",
        translit: "pneuma",
        definition: "Spirit, breath, wind. In Romans 8, the personal Holy Spirit indwelling believers.",
        usage: "Pneuma appears 21 times in Romans 8 alone — more than any other NT chapter.",
        occurrences: 379,
      },
    ],
    crossRefs: [
      { ref: "Romans 5:1", text: "Therefore, since we have been justified by faith, we have peace with God...", why: "The 'therefore' of 8:1 reaches back to Paul's earlier doctrine of justification." },
      { ref: "John 3:17", text: "For God did not send his Son into the world to condemn the world...", why: "John and Paul agree: condemnation is not the Father's posture toward those in Christ." },
      { ref: "Psalm 44:22", text: "Yet for your sake we are killed all the day long...", why: "Paul quotes this Psalm directly in v.36 — Israel's lament becomes the church's." },
    ],
    manuscript: {
      tradition: "Critical text. Romans 8 is preserved in remarkable agreement across all major textual families.",
      variants: "v.1 — some later manuscripts add 'who walk not according to the flesh but according to the Spirit' from v.4. The shorter reading is original.",
      transmission: "Present in 𝔓46 (c. AD 175–225), the earliest collection of Paul's letters.",
    },
  },
  "Psalms 23": {
    overview:
      "Psalm 23 is sung shepherd-theology. David, who knew sheep before he knew thrones, declares that YHWH himself is his shepherd — and therefore every fear has already been answered.",
    theology:
      "The shepherd metaphor flows through the entire canon: from Genesis 48 to Ezekiel 34 to John 10. Jesus picks up this Psalm explicitly when he says 'I am the good shepherd.' To pray Psalm 23 in Christian worship is to address Christ.",
    context:
      "Likely composed by David, possibly during a season of pursuit (Saul's persecution or Absalom's rebellion). 'The valley of the shadow of death' is not a poetic abstraction — David walked it.",
    application:
      "Notice the pronouns shift in v.4 from 'he' to 'you.' In the brightest pastures we speak ABOUT God; in the darkest valleys we speak TO him. Both are worship.",
    lexicon: [
      {
        word: "LORD",
        original: "יהוה",
        language: "Hebrew",
        strongs: "H3068",
        translit: "YHWH",
        definition: "The personal, covenant name of God — the One who simply IS.",
        usage: "Appears nearly 7,000 times in the Hebrew Bible. Translated 'LORD' (small caps) to distinguish from Adonai.",
        occurrences: 6828,
      },
      {
        word: "shepherd",
        original: "רָעָה",
        language: "Hebrew",
        strongs: "H7462",
        translit: "ra'ah",
        definition: "To shepherd, tend, feed, guide. Used of God (Ps 23, Ezek 34) and of Israel's leaders.",
        usage: "When Israel's human shepherds failed (Ezek 34), God promised to shepherd his people himself.",
        occurrences: 173,
      },
      {
        word: "soul",
        original: "נֶפֶשׁ",
        language: "Hebrew",
        strongs: "H5315",
        translit: "nephesh",
        definition: "Soul, life, self, the whole living person — not a separate immaterial part.",
        usage: "Used 754 times. The Hebrew vision of personhood is unified — body and soul together.",
        occurrences: 754,
      },
    ],
    crossRefs: [
      { ref: "John 10:11", text: "I am the good shepherd. The good shepherd lays down his life for the sheep.", why: "Jesus directly claims the role of YHWH the Shepherd from this Psalm." },
      { ref: "Ezekiel 34:11-16", text: "Behold, I, I myself will search for my sheep and will seek them out.", why: "God's promise to shepherd Israel personally — fulfilled in Christ." },
      { ref: "Revelation 7:17", text: "For the Lamb in the midst of the throne will be their shepherd...", why: "The Psalm's promise reaches its consummation at the throne of God." },
    ],
    manuscript: {
      tradition: "Masoretic Text, with confirmation from the Dead Sea Scrolls (11Q5).",
      variants: "Minor: LXX renders 'I shall not want' as 'I shall lack nothing' — same meaning, slightly different phrasing.",
      transmission: "Among the most stable texts in the Hebrew Bible. Sung continuously in synagogue and church for nearly three millennia.",
    },
  },
};

export function getCommentary(book: string, chapter: number): ClavisCommentary {
  return COMMENTARIES[`${book} ${chapter}`] ?? FALLBACK;
}

export function toneIntro(tone: ClavisTone): string {
  switch (tone) {
    case "scholarly":
      return "Clavis · scholarly mode";
    case "devotional":
      return "Clavis · devotional mode";
    case "auto":
      return "Clavis · adaptive";
    default:
      return "Clavis · balanced";
  }
}