# 🧠 Second Brain — a Claude-powered, Obsidian-compatible knowledge vault

A folder-based personal knowledge vault that is **100% Obsidian-compatible**
(plain Markdown + `[[wikilinks]]` + YAML frontmatter) with a **Claude ingestion
pipeline** on top. The workflow:

> Drop a source into `inbox/` → run `/ingest` → Claude turns it into atomic,
> cross-linked notes that light up Obsidian's graph view.

Because everything is just Markdown files in folders, there's no lock-in: the
vault works in Obsidian, any text editor, or plain `git`.

## What's in here

```
vault/
├── CLAUDE.md              # the rules Claude follows in this vault
├── README.md              # this file
├── .claude/commands/      # /ingest and /synthesize slash commands
├── inbox/                 # drop raw sources here (.md, .txt, .pdf, transcripts)
├── sources/               # originals, archived here after ingestion
├── notes/                 # atomic permanent notes — the graph nodes
├── maps/                  # Maps of Content (hub notes)
├── templates/note.md      # the note template
└── .obsidian/             # sensible default graph/app config
```

It ships with one example source, two interlinked notes
([[Active Recall]] + [[Spaced Repetition]]), and one Map of Content
([[Learning Science]]) so the graph isn't empty on day one.

## Open it in Obsidian

1. Install [Obsidian](https://obsidian.md) (free).
2. **Open folder as vault** → select **this `vault/` folder**.
3. Open the **Graph view** (the connected-dots icon in the left ribbon, or
   `Cmd/Ctrl-G`) to see notes as nodes and `[[wikilinks]]` as edges.

The core graph, backlinks, tags, outline, and templates plugins are enabled by
default via `.obsidian/`. For AI-powered semantic search *inside the app*,
install the **Smart Connections** community plugin (Settings → Community
plugins → Browse → "Smart Connections"). Note that **community plugins can only
be installed from within the Obsidian app, not from the CLI** — so that one
step is manual.

## Run the Claude pipeline

Run Claude Code **from inside this `vault/` folder** so it picks up `CLAUDE.md`
and the slash commands.

### Add a source
Drop any `.md`, `.txt`, transcript, or `.pdf` into `inbox/`.

### `/ingest` — sources → notes
Processes **every** file in `inbox/`. For each one Claude will:
1. Read it (Markdown, text, transcripts, and PDFs supported).
2. Extract the atomic ideas → **one note per idea** in `notes/`, using
   `templates/note.md`.
3. Scan existing `notes/` and add `[[wikilinks]]` **both ways** (link + backlink)
   to connect concepts.
4. Create or update a **Map of Content** in `maps/` for the topic.
5. Move the original into `sources/`.
6. Print a summary: notes created, notes linked, MOC updated.

### `/synthesize` — refresh the structure
Scans all of `notes/`, finds clusters of related ideas, and creates/refreshes
**Map-of-Content** hub notes in `maps/` that link out to them. It also reports
**orphan notes** (no links) so you can connect them. It does *not* create new
atomic notes — it organizes what already exists.

## Ask questions across the vault

Just ask in plain language, e.g.:

> *"What do my notes say about effective studying?"*

Claude reads across `notes/` (and `maps/` for orientation), answers using only
what your notes say, and **cites the note titles** it used — e.g. *"Based on
[[Active Recall]] and [[Spaced Repetition]]…"*. If your notes don't cover the
question, it'll tell you rather than make something up.

## The conventions (see `CLAUDE.md` for the full rules)

- **One idea per note.** Filenames are the human-readable concept title
  (`notes/Spaced Repetition.md`).
- **Every note has frontmatter:** `title`, `tags`, `source`, `created`.
- **Notes are written in your voice** — distilled, not copy-pasted.
- **Links go both ways.** Every relationship is a `[[wikilink]]` in one note and
  a backlink in the other. Dense interlinking is what produces the graph.
- **Never invent facts** that aren't in the source.
