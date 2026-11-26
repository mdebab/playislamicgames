# 🌙 Islamic Games (ألعاب إسلامية)

An interactive, responsive suite of 8 educational mini-games designed to help Muslims and learners engage with the Quran, Hadith, and Islamic knowledge in a fun, modern web interface. Powered entirely by live data from [UmmahAPI](https://ummahapi.com/).

## 🎮 Included Games

1. **Juz Amma Puzzle (تركيب جزء عم)** — Reassemble entire surahs word-by-word from shuffled tiles with verse audio recitation and a lives system.
2. **Hadith Grader (درجات الحديث)** — Test your hadith science knowledge by classifying traditions into Sahih, Hasan, or Da'if.
3. **99 Names of Allah (أسماء الله الحسنى)** — A 10-minute speed typing challenge accepting Arabic and transliteration.
4. **Ayah Guesser (تخمين السورة)** — Listen to and read an ayah, then identify which Surah it belongs to.
5. **Quranic Words Match (مطابقة الكلمات)** — Fast-paced vocabulary matching game pairing Quranic Arabic words with English translations.
6. **Revelation Timeline (ترتيب النزول)** — Arrange surahs chronologically by order of revelation.
7. **Dua Occasions (مناسبات الأدعية)** — Read authentic supplications and guess the correct occasion or context.
8. **Mystery Surah (السورة المجهولة)** — Daily Wordle-style surah deduction game using directional hints (ayah count, revelation order, place).

## 🛠️ Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) & React 19
- **Styling:** Tailwind CSS v4 with custom Islamic geometric motifs
- **Data Source:** [UmmahAPI](https://ummahapi.com/)
- **Icons:** Lucide React
- **Audio:** Web Audio API & UmmahAPI recitations


## 💻 Development

```sh
bun install   # or npm i
bun run dev
```

## 🌐 Production

```sh
bun run build
node .output/server/index.mjs
```
