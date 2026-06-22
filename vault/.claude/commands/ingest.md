---
description: Turn every raw source in inbox/ into atomic, cross-linked notes
---

Ingest every file currently in `inbox/` and turn it into atomic, cross-linked
permanent notes. Follow all the rules in `CLAUDE.md`.

Process each file in `inbox/` one at a time:

1. **Read the source.** Support `.md`, `.txt`, transcripts, and `.pdf`. (Use
   the Read tool for PDFs.) If a file can't be read, report it and skip it —
   do not guess at its contents.

2. **Extract atomic ideas.** Identify the distinct concepts in the source.
   Create **one note per idea** in `notes/`, using `templates/note.md` as the
   shape:
   - Filename = the human-readable concept title, e.g. `notes/Spaced Repetition.md`.
   - Frontmatter: `title`, `tags` (topical, lowercase), `source` (a
     `[[wikilink]]` to the archived source title), `created` (today's date,
     `YYYY-MM-DD`).
   - Body: the idea explained concisely in my voice — distilled, not copied.
   - If a note with that title already exists, enrich it rather than
     duplicating it.

3. **Interlink.** Scan existing `notes/` for related concepts. For every
   genuine relationship, add a `[[wikilink]]` in the new note's `## Related`
   section **and** a reciprocal backlink in the related note's `## Related`
   section. Aim for dense, meaningful links — note *why* two notes connect.

4. **Map of Content.** Create or update a hub note in `maps/` for the source's
   topic, linking out to the notes you created or touched. If a fitting MOC
   already exists, add the new notes to it.

5. **Archive the original.** Move the source file from `inbox/` into `sources/`
   (keep its name; this is the title referenced by each note's `source` field).

6. **Print a summary** for each source and a total:
   - Notes created (with titles)
   - Notes linked / backlinks added
   - MOC(s) created or updated
   - Source(s) archived

If `inbox/` is empty, say so and stop.

$ARGUMENTS
