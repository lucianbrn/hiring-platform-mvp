# UI Blueprint Prompt — "Hiring Platform"

Paste the prompt below into a UI-generation tool (v0, Lovable, Figma Make, or
Claude in design mode) to turn the product into a clickable, high-fidelity
blueprint. Tailoring notes are at the bottom.

---

## The prompt

> Design a **clickable, high-fidelity UI blueprint** for a **swipe-based hiring
> platform for full-time, early-career roles** — "Tinder for hiring, but
> intentional, private, and trust-first." Responsive web app, desktop-first but
> mobile-aware. Build a shared component system and lay out every screen plus its
> loading / empty / error states.
>
> **Core loop:** a candidate builds an education + skills profile → an algorithm
> auto-matches candidates into each job's pool → recruiters swipe a match-ranked
> candidate feed → a like + message opens a **two-way-consent** chat (it stays
> *pending* until the candidate replies, then turns *active*). Paid tiers unlock more.
>
> **Two roles, two experiences:**
> - **Candidate** — gets discovered, edits profile, replies to recruiters. Free +
>   "Premium" ($4.99/mo).
> - **Recruiter** — creates a company, posts jobs, swipes candidates, messages
>   them. Free + "Pro" ($99/mo).
>
> **Make these three differentiators visually prominent, not buried:**
> 1. **Match score** — each candidate card shows a 0–100% score with a checkable
>    reason breakdown (Degree / GPA / Skills / Location: "✓ Meets degree", etc.).
> 2. **Two-way consent** — pending vs active thread state is obvious in the chat
>    list and thread header.
> 3. **Trust** — verified-email and verified-company badges; unverified accounts
>    look visibly limited.
>
> **Design direction:** trustworthy, calm, premium (not a flashy dating app).
> Generous whitespace. Indigo→violet primary (#6366f1 → #4f46e5) with a pink
> accent (#ec4899); green = verified/success, amber = pending. Rounded-xl cards,
> soft shadows, large readable type, gradient hero blocks. Accessible contrast,
> visible focus rings, keyboard-friendly. Components: button (primary/secondary),
> input, select, card, badge/chip, avatar, progress bar, modal, toast.
>
> **Screens:**
> - *Public:* Landing (gradient hero + value prop + Sign In/Up), Register
>   (name, email, password, Candidate/Recruiter toggle), Login, Verify-email
>   (check-inbox state + success state).
> - *Candidate:* Dashboard (profile summary, verified badge, current plan,
>   quick links, Upgrade-to-Premium card), Profile editor (live completion
>   progress bar; degree type dropdown, field, school, GPA, skills chips,
>   preferred-location chips, relocate toggle), Discover-companies (swipeable
>   card, Pass/Like, "X of Y" counter, "No more cards" empty state).
> - *Recruiter:* Company setup (name, website, size, industry, description, logo),
>   Job posting (title, description, salary range, required degree, target-location
>   chips, remote/hybrid/onsite; on submit show "12 candidates auto-matched"),
>   Discover-candidates (card with name, school, degree/field, location, **match
>   score % + reason breakdown**, optional AI summary; Pass/Like/Message).
> - *Shared:* Messages (two-pane: conversation list with pending/active badges +
>   thread view with left/right bubbles and a composer; empty state), Pricing
>   (Premium $4.99 vs Pro $99 cards with feature lists and a checkout CTA).
>
> **Deliverable:** a navigable multi-screen blueprint with a consistent
> spacing/type scale, the candidate and recruiter flows clearly separated, and a
> one-line annotation per screen describing its purpose and key interaction.

---

## Tailoring notes
- **v0 / Lovable (code output):** use as-is — they'll emit React + Tailwind that
  matches this repo's stack (Next.js + Tailwind).
- **Figma Make / static mockups:** append *"Output static frames only, no code;
  include a dedicated components page."*
- **Want to test a tool fast?** Ask for just one screen first — the recruiter
  **Discover-candidates** card with the match-score breakdown is the most
  distinctive single view.
- **Brand colors** above mirror `tailwind.config.js` (`primary` #6366f1 /
  #4f46e5, `accent` #ec4899) so generated UI stays consistent with the codebase.
