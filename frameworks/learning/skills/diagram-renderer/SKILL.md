---
name: diagram-renderer
description: Use this skill whenever the user asks for a diagram, flowchart, architecture diagram, structural diagram, or any visual explanation of how something is organised or how it works. Triggers include explicit requests ("draw a diagram", "visualise this flow", "show me the architecture"), and also implicit cases where a diagram would clarify better than prose (a request lifecycle, a system's components, a decision tree, a containment hierarchy). Produces SVG diagrams following a strict visual system: orthogonal connectors only (no diagonals), rounded rectangular nodes, two-weight typography, a flat fill-and-stroke aesthetic, and a curated palette where colour encodes meaning rather than sequence. Only nodes carry backgrounds; containers, legends, and the canvas itself are transparent. Do NOT use for data charts, UI mockups, illustrative cross-sections, or full ER diagrams with cardinality.
---

# diagram-renderer

Produce diagrams as SVG. The goal is not "a diagram that works" — it is a diagram that looks like it was drawn by someone who cares about craft. Consistency across outputs matters more than individual cleverness.

## Principles

Ordered. Earlier wins when they conflict.

**1. Orthogonal geometry only.** Every connector is a straight horizontal line, a straight vertical line, or an L-shape with sharp 90° bends (U-shape when routing around obstacles). No diagonals, no curves, no "almost straight" segments — even a 4px drift counts.

Operational check, applied as you write each `d="..."`: in `M x1 y1 L x2 y2`, either `x1 == x2` (vertical) or `y1 == y2` (horizontal). If both change in a single `L`, it's a diagonal — route through an intermediate point: `M x1 y1 L xb y1 L xb y2 L x2 y2` or the vertical-first equivalent.

**2. One SVG, one level of zoom.** A single SVG shows one diagram at one level of detail. If the subject needs "the big picture" *and* "how component X works inside", those are separate SVGs with prose between them. No stacked posters. Refuse "architecture + flow + features all in one" framings and produce several focused SVGs instead.

**3. Grid-aligned layout.** Commit to column centres and row centres before placing anything. Every node centres on a grid intersection. L-bends occur at grid intersections too. If a pair is "almost" aligned, fix the grid — don't paper over it with a short diagonal.

**4. Colour encodes meaning, not position.** At most three accent ramps per diagram. Nodes sharing a semantic role share a ramp; structural/neutral nodes use the neutral ramp. Semantic ramps (warn/err) only when the node genuinely represents that state.

Operational check: before assigning ramps, write one sentence per category naming what its members share. If the distinguishing sentence says "these come later in the flow" or "these are the second group", that's sequence — collapse into one category.

**5. The diagram reads without labels.** Spatial arrangement carries meaning; labels annotate. If removing every `<text>` would leave it incomprehensible, the geometry isn't doing its job.

**6. Restraint over completeness.** Ask of each node: does it teach the reader something the rest of the diagram doesn't already imply? If no, cut it. When the subject genuinely needs many nodes, split (principle 2).

## Canvas

```
<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 W H" role="img">
  <title>...</title><desc>...</desc>
  <defs>...</defs>
  ...
</svg>
```

`W` is 720–880. `H` = bottom of lowest element + 32px. Background transparent. 32px safe margin on all sides. `<title>` and `<desc>` come first and are written for a screen reader.

## Titles and language

Titles can go inside the SVG or in the response prose — pick by context. Inside when the diagram stands alone as a deliverable; in prose when the response already introduces it. When inside, one title maximum, use class `t` (or a one-off `font-size` with weight 500, never 600+), top-centred within the safe margin.

Text in the diagram follows the user's language. Don't mix. Technical identifiers (`index.ts`, `AGENTS.md`) keep their native form.

## Design tokens

One `<style>` block in `<defs>`, this is the entire palette and typography system:

```
<style>
  :root {
    --ink: #1A1A1A; --ink-muted: #5C5C58; --ink-soft: #8A8A84;
    --line: #D8D6CF; --line-strong: #9C9A92;
    --n-fill: #F1EFE8; --n-stroke: #B4B2A9; --n-ink: #2C2C2A;
    --a-fill: #EEEDFE; --a-stroke: #7F77DD; --a-ink: #26215C;
    --b-fill: #E1F5EE; --b-stroke: #1D9E75; --b-ink: #04342C;
    --c-fill: #FAECE7; --c-stroke: #D85A30; --c-ink: #4A1B0C;
    --warn-fill: #FAEEDA; --warn-stroke: #BA7517; --warn-ink: #412402;
    --err-fill: #FCEBEB; --err-stroke: #E24B4A; --err-ink: #501313;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ink: #EDEBE3; --ink-muted: #B4B2A9; --ink-soft: #888780;
      --line: #3A3A37; --line-strong: #5F5E5A;
      --n-fill: #2C2C2A; --n-stroke: #5F5E5A; --n-ink: #D3D1C7;
      --a-fill: #26215C; --a-stroke: #AFA9EC; --a-ink: #CECBF6;
      --b-fill: #04342C; --b-stroke: #5DCAA5; --b-ink: #9FE1CB;
      --c-fill: #4A1B0C; --c-stroke: #F0997B; --c-ink: #F5C4B3;
      --warn-fill: #412402; --warn-stroke: #EF9F27; --warn-ink: #FAC775;
      --err-fill: #501313; --err-stroke: #F09595; --err-ink: #F7C1C1;
    }
  }
  .t { font: 500 14px/1 system-ui, sans-serif; fill: var(--ink); }
  .ts { font: 400 12px/1 system-ui, sans-serif; fill: var(--ink-muted); }
  .label { font: 400 11px/1 system-ui, sans-serif; fill: var(--ink-soft); letter-spacing: .02em; text-transform: uppercase; }
  .node rect { stroke-width: 1; }
  .conn { stroke: var(--line-strong); stroke-width: 1; fill: none; }
  .conn-dashed { stroke: var(--line-strong); stroke-width: 1; fill: none; stroke-dasharray: 4 4; }
  .cat-a .fill { fill: var(--a-fill); } .cat-a .stroke { stroke: var(--a-stroke); } .cat-a .ink { fill: var(--a-ink); }
  .cat-b .fill { fill: var(--b-fill); } .cat-b .stroke { stroke: var(--b-stroke); } .cat-b .ink { fill: var(--b-ink); }
  .cat-c .fill { fill: var(--c-fill); } .cat-c .stroke { stroke: var(--c-stroke); } .cat-c .ink { fill: var(--c-ink); }
  .cat-n .fill { fill: var(--n-fill); } .cat-n .stroke { stroke: var(--n-stroke); } .cat-n .ink { fill: var(--n-ink); }
</style>
```

Do not introduce colours, fonts, or stroke widths outside this block. No inline `style="..."` on text. Three sizes (14/12/11px), two weights (400/500), sentence case everywhere except the uppercased `.label` class.

## Nodes

Rounded rectangles only. Nodes are the sole elements that carry a fill.

- **Single-line**: height 48, width = max(120, text_width + 32), `rx="6"`.
- **Two-line** (title + subtitle): height 60, `rx="6"`. Title at centre-8, subtitle at centre+9, both `text-anchor="middle"` and `dominant-baseline="central"`.
- Actors, terminators (start/end), and anything else that might tempt a pill shape are still rectangles with `rx="6"`. Differentiate them from processing nodes by category (`cat-n` for neutral actors) and position, not by shape.
- **No decision diamonds.** Express a decision as a node + two outgoing connectors labelled "yes"/"no".
- **No pills, no circles, no hexagons.** `rx="6"` is the only radius.

Template:

```
<g class="node cat-a">
  <rect class="fill stroke" x="..." y="..." width="..." height="48" rx="6"/>
  <text class="t ink" x="..." y="..." text-anchor="middle" dominant-baseline="central">Label</text>
</g>
```

Categories: `cat-a` (primary work), `cat-b` (secondary), `cat-c` (third, rare), `cat-n` (neutral/structural), `cat-warn`, `cat-err`.

## Containers

Group nodes visually. **No fill — transparent only.** Dashed border, nothing more.

```
<rect x="..." y="..." width="..." height="..." rx="10"
      fill="none" stroke="var(--line)" stroke-dasharray="4 4"/>
<text class="label" x="..." y="...">Label at top-left, offset 14 right 20 down from corner</text>
```

Padding inside: 24px minimum between container edge and any child. Maximum two nesting levels. Flows entering or exiting a container should be deliberate (one clear entry, one clear exit), not incidental.

## Connectors

All connectors are `<path>` with `fill="none"` (implicit via `.conn*` classes).

- Straight: `M x1 y1 L x2 y2` where one coordinate matches.
- L-bend: `M x1 y1 L xb y1 L xb y2 L x2 y2` (horizontal-first) or vertical-first.
- U-bend: three segments, two 90° bends.

Endpoints stop at the node edge, not the centre. Solid `.conn` for direct relationships, `.conn-dashed` for indirect/async/optional. Arrowhead marker defined once in `<defs>`:

```
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke"
        stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
```

`context-stroke` lets the head inherit the line's colour. Connector labels are rare; when needed, place them next to the bend, not floating on a segment midpoint.

## Legends

Optional. When colour categories are self-evident from the diagram's structure, skip the legend entirely.

When included: below the diagram, separated by ≥32px, **no background fill, no border** — just the swatches and labels floating in the canvas. Each entry is a 12×12 `rx="3"` rect with the appropriate `cat-X` class, followed 6px right by a `class="ts"` label, vertically centred. Only legend categories that actually appear.

## Layout defaults

Deviate when the subject demands it.

- **Flows**: top-to-bottom; left-to-right works for 3–4 short stages.
- **Trees, hierarchies, decompositions**: top-to-bottom, parent above children.
- **Architectures**: layered — external actors at top/left, core in middle, infrastructure at bottom/right.
- **Containment**: nested containers, largest outside.
- Spacing: ≥32px between siblings on the same axis, ≥48px between rows/columns. Consistent node widths within a row signal peer relationships.

## Workflow

1. Identify the diagram's job (flow / architecture / decomposition / containment).
2. Decide scope: one SVG or several. Split when the subject naturally splits (principle 2).
3. List nodes with titles, optional ≤5-word subtitles, and categories. Run the colour check (principle 4) before assigning ramps.
4. List connections as source → target, solid or dashed.
5. Commit to a grid: column centres, row centres.
6. Write the SVG: `<defs>` (style + arrow marker) → containers → nodes → connectors on top. Run the diagonal check (principle 1) on each path as you write its `d`.
7. Verify: viewBox height hugs content +32px; every `<text>` has a class; no diagonals; no colour outside tokens; no inline `style=`; no container or legend has a fill.

## Minimal example

Three nodes, one dashed side-channel. Demonstrates: a neutral actor (client), two processing nodes sharing category A (same role), a sink in category B (different kind of thing), a dashed vertical connector that needs no L-bend because source and target share a column.

```
<g class="node cat-n">
  <rect class="fill stroke" x="60" y="56" width="120" height="48" rx="6"/>
  <text class="t ink" x="120" y="80" text-anchor="middle" dominant-baseline="central">Client</text>
</g>
<g class="node cat-a">
  <rect class="fill stroke" x="296" y="56" width="128" height="48" rx="6"/>
  <text class="t ink" x="360" y="80" text-anchor="middle" dominant-baseline="central">Gateway</text>
</g>
<g class="node cat-a">
  <rect class="fill stroke" x="536" y="56" width="128" height="48" rx="6"/>
  <text class="t ink" x="600" y="80" text-anchor="middle" dominant-baseline="central">Service</text>
</g>
<g class="node cat-b">
  <rect class="fill stroke" x="536" y="132" width="128" height="32" rx="6"/>
  <text class="ts ink" x="600" y="148" text-anchor="middle" dominant-baseline="central">Audit log</text>
</g>
<path class="conn" d="M 180 80 L 296 80" marker-end="url(#arrow)"/>
<path class="conn" d="M 424 80 L 536 80" marker-end="url(#arrow)"/>
<path class="conn-dashed" d="M 600 104 L 600 132" marker-end="url(#arrow)"/>
```

## What to refuse

- Data charts, UI mockups, illustrative cross-sections, full ERDs with cardinality markers: decline, wrong skill.
- Single-SVG posters covering multiple levels of detail: decline the framing, produce several focused SVGs.

## Non-negotiables

- No diagonals. No curves. No rounded bends on connectors.
- One SVG per level of zoom.
- Only nodes carry fills. Containers, legends, and the canvas are transparent.
- No colour, font, or stroke width outside the token block.
- No inline `style=` overriding typography.
- No text below 11px. No Title Case or ALL CAPS outside `.label`.
- No `<text>` without `t` / `ts` / `label`.
- No element outside the 32px safe margin.
- No decision diamonds, no pills, no circles, no gradients, no shadows, no glow, no 3D. `rx="6"` is the only node radius.