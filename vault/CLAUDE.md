# Second Brain — Vault Rules

This folder is a personal knowledge vault. It is **100% Obsidian-compatible**:
plain Markdown, `[[wikilinks]]`, and YAML frontmatter — nothing proprietary.
You (Claude) help me turn raw sources into atomic, densely-linked notes that
light up Obsidian's graph view.

Open **this `vault/` folder** as the vault in Obsidian, and run Claude Code
from **inside this folder** so the `/ingest` and `/synthesize` commands are
available.

## Folder map

| Folder        | What lives here                                              |
| ------------- | ----------------------------------------------------------- |
| `inbox/`      | Raw sources I drop in (`.md`, `.txt`, transcripts, `.pdf`). |
| `sources/`    | Originals, archived here after they're ingested.            |
| `notes/`      | Atomic permanent notes — the nodes of the graph.            |
| `maps/`       | Maps of Content (MOCs) — hub notes that link clusters.      |
| `templates/`  | Note templates (`note.md`).                                 |
| `.obsidian/`  | Default graph/app config (documented, optional).            |

## Rules you follow in this vault

1. **One idea per note.** Every file in `notes/` is a single atomic concept.
   If a source contains five ideas, that's five notes.
2. **Human-readable filenames.** Name the file after the concept title, e.g.
   `notes/Spaced Repetition.md`. No dates, IDs, or slugs in the filename.
3. **Every note has YAML frontmatter:** `title`, `tags`, `source`, `created`.
   Use the shape in `templates/note.md`.
4. **Write in my voice.** Concise, plain-language explanations of the idea —
   *not* copy-paste from the source. Distill, don't transcribe.
5. **Always link both ways.** When a new note relates to an existing one, add a
   `[[wikilink]]` in the new note **and** a backlink in the related note (under
   its `## Related` section). Dense interlinking is the goal — that's what
   produces the graph. A note with zero links is a bug to be fixed.
6. **Group into Maps of Content.** When several notes share a topic, create or
   update a hub note in `maps/` that links out to them.
7. **Never invent facts.** Only write what's supported by the source. If
   something is unclear or unverified, say so in the note rather than guessing.
8. **Archive sources.** After ingesting a file from `inbox/`, move the original
   into `sources/` so the inbox stays a true to-do queue.

## Querying the vault

When I ask a question ("what do my notes say about X?"), read across `notes/`
(and `maps/` for orientation), answer using only what my notes say, and **cite
the note titles** you drew from (e.g. _Based on [[Spaced Repetition]] and
[[Active Recall]]…_). If my notes don't cover it, say so plainly.
