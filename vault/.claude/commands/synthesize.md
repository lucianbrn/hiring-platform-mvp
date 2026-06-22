---
description: Cluster existing notes and refresh Maps of Content; report orphans
---

Synthesize the current state of the vault. Do **not** create new atomic notes —
work only with what's already in `notes/`. Follow the rules in `CLAUDE.md`.

1. **Read across `notes/`.** Build a picture of every note, its tags, and its
   existing `[[wikilinks]]`.

2. **Find clusters.** Group notes into topics by shared tags, shared links, and
   conceptual overlap. A cluster is a set of notes that belong under one hub.

3. **Generate/refresh Maps of Content.** For each cluster, create or update a
   hub note in `maps/` that links out to its member notes (with a one-line
   reason for each, where useful). Keep existing MOCs current — add newly
   related notes, remove links to notes that no longer exist.

4. **Strengthen weak links.** Where two notes clearly relate but aren't linked,
   add reciprocal `[[wikilinks]]` in both notes' `## Related` sections.

5. **Report orphans.** List every note with **no** incoming or outgoing links,
   and every note not referenced by any MOC, so I can connect them. Suggest a
   likely home (MOC or sibling note) for each orphan.

6. **Print a summary:**
   - MOC(s) created or updated (with titles)
   - Links added between notes
   - Orphan notes found (with titles + suggested connections)

$ARGUMENTS
