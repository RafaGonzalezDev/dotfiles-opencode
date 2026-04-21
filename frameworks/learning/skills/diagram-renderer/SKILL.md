---
name: diagram-renderer
description: Use this skill whenever the user asks for a diagram, flowchart, architecture diagram, structural diagram, or any visual explanation of how something is organised or how it works. Triggers include explicit requests ("draw a diagram", "visualise this flow", "show me the architecture"), and also implicit cases where a diagram would clarify the answer better than prose (explaining a request lifecycle, a system's components, a decision tree, a containment hierarchy). The skill produces a single SVG that follows a strict visual system: orthogonal connectors only (no diagonals), rounded rectangular nodes, a constrained two-weight typography, a flat fill-and-stroke aesthetic, and a curated colour palette where colour encodes meaning rather than sequence. Do NOT use this skill for data charts (bar/line/pie), UI mockups, illustrative physical cross-sections, or ER diagrams — those need different tools.
---

# diagram-renderer

You produce diagrams as a single SVG element following a fixed visual system. The goal is not "a diagram that works" — it is a diagram that looks like it was drawn by someone who cares about craft. Consistency across outputs matters more than individual cleverness.

## Core principles

These principles are ordered. When they conflict, the earlier one wins.

### 1. Orthogonal geometry only

Every connector between nodes is either a straight horizontal line, a straight vertical line, or an L-shaped path composed of one horizontal and one vertical segment (optionally a Z/U with two bends). **Diagonal lines never appear as connectors.** A diagonal signals "I didn't plan the layout" and breaks the visual system instantly.

- Direct parent-child or sibling relationships between aligned nodes → straight line.
- Any connection where source and target are not aligned on one axis → L-shaped path with a single 90-degree bend.
- When a connection must cross another element, it uses a U-shape (two bends) that routes around, never through.
- Bends are sharp right angles. No rounded corners on connector paths, no Bézier curves, no "almost-straight" diagonals.

Diagonals are permitted in exactly one case: as a deliberate visual device inside a node (a strikethrough, an icon stroke). Never as a connector.

### 2. Grid-aligned layout

Before placing anything, commit to a grid. Decide the column centres and row centres first, then place nodes on that grid. This is what makes L-connectors work — if two nodes share a column or a row, a single straight segment connects them; if they don't, you know exactly where the bend goes.

- Default grid: column centres at fixed x coordinates, row centres at fixed y coordinates. Pick 3-5 columns and as many rows as you need.
- Every node is centred on a grid intersection. Nodes may span multiple columns or rows, but their centres still align to the grid.
- L-bends occur at grid intersections too. A connector leaving node A heading to node B in a different column and row bends at the intersection of (A's row, B's column) or (A's column, B's row) — pick whichever keeps the bend away from other nodes.

### 3. Colour encodes meaning, not position

Pick at most three ramps per diagram. Nodes of the same semantic category share one ramp. Neutral/structural nodes (start, end, generic stages, containers) use the neutral ramp.

- Never assign colour by order (first node = colour A, second = colour B, third = colour C). That is sequence, not meaning.
- Ramps carry implicit meaning. Respect it: accent ramps for foregrounded work, success/warning/danger ramps only when the node genuinely represents that state, neutral for everything unremarkable.
- If a diagram has no distinct semantic categories, use only the neutral ramp. A monochrome diagram is correct; a rainbow diagram is wrong.

### 4. The diagram should read with the labels removed

Spatial arrangement carries the meaning. Labels annotate. Flow direction, containment, grouping, and emphasis must all be legible from geometry alone. If removing every text element would leave an incomprehensible diagram, the structure is doing no work and the labels are carrying a load they shouldn't.

### 5. Restraint over completeness

A diagram with 4 nodes and room to breathe beats a diagram with 12 nodes that fit. If the subject has more than ~6 meaningful nodes at one level of detail, split into multiple diagrams (overview + detail) rather than cramming. If a node's subtitle needs more than 5 words, the wrong content is in the diagram.

## The visual system

### Canvas

Every diagram is a single `<svg>` element, no wrappers:

```
<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 W H" role="img">
  <title>...</title>
  <desc>...</desc>
  <defs>...</defs>
  ...
</svg>
```

- Width is fixed at the viewBox-declared `W` (typically 720–880 depending on content). Height `H` is set tightly: bottom of the lowest element + 32px bottom padding. Never leave slack at the bottom.
- Background is transparent. The host provides any card/background; the SVG does not.
- Safe area: 32px margin on all sides. Nothing — stroke, text baseline, arrowhead — sits outside this margin.
- `<title>` and `<desc>` are mandatory and come first inside the SVG. They are the accessible name and description. Write them for a screen reader, not as decoration.

### Design tokens

Define these once in `<defs>` as a `<style>` block. Use CSS custom properties so a single change propagates. Every colour below is chosen to work on both light and dark host backgrounds; if you need dark-mode specific values, use `@media (prefers-color-scheme: dark)` inside the same `<style>`.

```
<style>
  :root {
    /* Surfaces and strokes */
    --bg:          #FFFFFF;
    --surface:     #FAFAF7;
    --ink:         #1A1A1A;
    --ink-muted:   #5C5C58;
    --ink-soft:    #8A8A84;
    --line:        #D8D6CF;
    --line-strong: #9C9A92;

    /* Neutral ramp (default) */
    --n-fill:   #F1EFE8;
    --n-stroke: #B4B2A9;
    --n-ink:    #2C2C2A;

    /* Accent A — primary work / default highlighted nodes */
    --a-fill:   #EEEDFE;
    --a-stroke: #7F77DD;
    --a-ink:    #26215C;

    /* Accent B — secondary category / counterpart to A */
    --b-fill:   #E1F5EE;
    --b-stroke: #1D9E75;
    --b-ink:    #04342C;

    /* Accent C — third category, used rarely */
    --c-fill:   #FAECE7;
    --c-stroke: #D85A30;
    --c-ink:    #4A1B0C;

    /* Semantic — use only when node means this */
    --warn-fill:   #FAEEDA;
    --warn-stroke: #BA7517;
    --warn-ink:    #412402;
    --err-fill:    #FCEBEB;
    --err-stroke:  #E24B4A;
    --err-ink:     #501313;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: transparent;
      --surface:     #1E1E1C;
      --ink:         #EDEBE3;
      --ink-muted:   #B4B2A9;
      --ink-soft:    #888780;
      --line:        #3A3A37;
      --line-strong: #5F5E5A;

      --n-fill:   #2C2C2A;   --n-stroke: #5F5E5A;   --n-ink:   #D3D1C7;
      --a-fill:   #26215C;   --a-stroke: #AFA9EC;   --a-ink:   #CECBF6;
      --b-fill:   #04342C;   --b-stroke: #5DCAA5;   --b-ink:   #9FE1CB;
      --c-fill:   #4A1B0C;   --c-stroke: #F0997B;   --c-ink:   #F5C4B3;
      --warn-fill: #412402;  --warn-stroke: #EF9F27; --warn-ink: #FAC775;
      --err-fill:  #501313;  --err-stroke:  #F09595; --err-ink:  #F7C1C1;
    }
  }

  .node rect { stroke-width: 1; }
  .t  { font: 500 14px/1 system-ui, -apple-system, "Segoe UI", sans-serif; fill: var(--ink); }
  .ts { font: 400 12px/1 system-ui, -apple-system, "Segoe UI", sans-serif; fill: var(--ink-muted); }
  .label { font: 400 11px/1 system-ui, -apple-system, "Segoe UI", sans-serif; fill: var(--ink-soft); letter-spacing: 0.02em; text-transform: uppercase; }

  .conn       { stroke: var(--line-strong); stroke-width: 1; fill: none; }
  .conn-dashed{ stroke: var(--line-strong); stroke-width: 1; fill: none; stroke-dasharray: 4 4; }
  .conn-soft  { stroke: var(--line); stroke-width: 1; fill: none; }

  .cat-a .fill { fill: var(--a-fill); } .cat-a .stroke { stroke: var(--a-stroke); } .cat-a .ink { fill: var(--a-ink); }
  .cat-b .fill { fill: var(--b-fill); } .cat-b .stroke { stroke: var(--b-stroke); } .cat-b .ink { fill: var(--b-ink); }
  .cat-c .fill { fill: var(--c-fill); } .cat-c .stroke { stroke: var(--c-stroke); } .cat-c .ink { fill: var(--c-ink); }
  .cat-n .fill { fill: var(--n-fill); } .cat-n .stroke { stroke: var(--n-stroke); } .cat-n .ink { fill: var(--n-ink); }
</style>
```

This block is the whole design system. Do not introduce other colours, fonts, or stroke widths in the diagram body. If you find yourself reaching for a one-off colour, the category system is wrong, not the palette.

### Typography

Two sizes, two weights, one family.

- 14px medium (`class="t"`) — node titles, section headers.
- 12px regular (`class="ts"`) — subtitles, connector labels (rare), secondary annotations.
- 11px regular uppercase (`class="label"`) — section/group labels on containers, used sparingly.
- Sentence case everywhere. Never Title Case, never ALL CAPS (except the 11px tracked labels, whose uppercasing is a deliberate typographic device).
- SVG `<text>` does not wrap. If a label would overflow, shorten it — don't split across `<tspan>`s except for a deliberate title + subtitle pair.
- Every `<text>` inside a box uses `text-anchor="middle"` and `dominant-baseline="central"`, with `x` = box centre x and `y` = box centre y. For title + subtitle: title at y = centre - 8, subtitle at y = centre + 9.

### Nodes

Nodes are rounded rectangles. No other shapes for standard nodes.

- **Single-line node**: 48px tall, width = max(120, text_width + 32). `rx="6"`.
- **Two-line node** (title + subtitle): 60px tall, width = max(140, longest_text_width + 32). `rx="6"`.
- **Container** (wraps a group of nodes): rounded rect with `rx="10"`, stroke-dashed (`stroke-dasharray="4 4"`), stroke `var(--line)`, fill `var(--surface)` or `none`. Padding inside: 24px minimum. Label sits at the top-left inside the container, using `class="label"`, 12px down and 14px right from the container corner.
- **Start/end terminators**: same as single-line node but `rx="24"` (pill shape). Always use the neutral category.
- **Decision diamonds are not used.** Decisions are expressed as a node labelled with the question and two outgoing connectors labelled "yes" / "no" (or equivalent). The diamond shape fights the grid and the rest of the visual system.

Node structure template:

```
<g class="node cat-a">
  <rect class="fill stroke" x="..." y="..." width="..." height="48" rx="6"/>
  <text class="t ink" x="..." y="..." text-anchor="middle" dominant-baseline="central">Label</text>
</g>
```

Every node gets wrapped in a `<g class="node cat-X">` where X is one of `a`, `b`, `c`, `n`, `warn`, `err`. The cat class selects fill, stroke, and ink colours in one go. Changing a node's category is a one-word edit.

### Connectors

All connectors are `<path>` elements (never `<line>` for L-bends — a polyline path keeps the code uniform).

- **Straight** (same row or same column): `<path class="conn" d="M x1 y1 L x2 y2" marker-end="url(#arrow)"/>`.
- **L-bend** (different row and column): `<path class="conn" d="M x1 y1 L xb y1 L xb y2 L x2 y2" marker-end="url(#arrow)"/>` where `xb` is the column of the bend. For a vertical-first L-bend: `M x1 y1 L x1 yb L x2 yb L x2 y2`.
- **U-bend** (routing around an obstacle): three segments, two 90-degree bends. Keep the two horizontal or two vertical segments on different rows/columns.
- Connector endpoints stop at the node edge, not the node centre. Compute: if a connector arrives from the left at a node whose left edge is x=200, the path's last point is x=200, not x=260. The arrowhead sits exactly at the edge.
- Stroke width is 1px. Stroke colour is `var(--line-strong)` (solid) or the same with `stroke-dasharray="4 4"` (dashed, used for "indirect" / "async" / "optional" relationships).
- Arrowhead is a single open chevron marker defined once in `<defs>`:

```
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke"
          stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
```

`context-stroke` makes the arrowhead inherit the connector's colour automatically — a dashed line and a solid line both get correctly-coloured heads with no extra markup.

- Connector labels are rare. Prefer putting the relationship meaning in the nodes themselves. When a label is needed (most often on a decision branch), place it next to the bend, not floating on the segment midpoint, and use `class="ts"`.

### Containment and hierarchy

- Containers group nodes. Arrows do not cross container boundaries casually — if a flow enters or exits a container, that is meaningful and should look deliberate (one entry point, one exit point, both clearly aligned to the container edge).
- Maximum two nesting levels. Deeper hierarchy becomes unreadable at any width.
- A container must have at least 24px padding between its inner edge and any child node. Child nodes do not touch the container.

## Layout heuristics

These are not rules but strong defaults. Deviate when the subject demands it.

- **Flows** (sequence of steps): top-to-bottom for most cases — matches reading direction on mobile, handles arbitrary depth. Left-to-right works when there are 3–4 stages and the vertical footprint matters.
- **Trees and hierarchies** (dependencies, org charts, decompositions): top-to-bottom, parent above children.
- **Architectures** (components with bidirectional relationships): layered — external actors top or left, core components middle, infrastructure bottom or right.
- **Containment** (things inside things): nested containers, largest outside, innermost in the middle.
- Spacing: 32px minimum between sibling nodes on the same axis, 48px between successive rows/columns. Less than that and the diagram feels cramped.
- Consistent node widths within a visual row communicate "these are peers". Vary width only when emphasising a difference in role.

## Workflow

When asked to produce a diagram:

1. **Identify the diagram's job.** Flow? Architecture? Decomposition? Containment? The job determines the layout family (see heuristics above).
2. **List the nodes and their categories.** A node has a title, optionally a ≤5-word subtitle, and one of {a, b, c, n, warn, err}. Write this list out before drawing. If a node has no clear category, it's neutral — don't invent one.
3. **List the connections.** Source → target, plus optional label. Mark each as solid (direct) or dashed (indirect/async/conditional).
4. **Commit to a grid.** Decide column centres and row centres. Assign every node to a grid cell.
5. **Check pairwise collisions.** For each connector, verify its path doesn't cross any non-endpoint node. If it does, route around with a U-bend or re-assign the grid.
6. **Write the SVG.** Defs first (style + arrow marker), then containers (back to front), then nodes, then connectors (connectors on top so arrowheads sit above node strokes).
7. **Verify.** ViewBox height matches content + 32px bottom margin. Every `<text>` has a class. Every connector has `fill="none"`. No diagonals. No colour outside the token system.

## Minimal working example

A three-node linear flow — the smallest diagram that exercises the whole system. Use this shape as a reference, not a template to copy verbatim.

```
<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 720 180" role="img">
  <title>Request lifecycle</title>
  <desc>A client request passes through a gateway to a service, with a dashed indirect path to a logging sink.</desc>
  <defs>
    <style>/* ...design tokens from above... */</style>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- Row y=80, columns at x=120, 360, 600 -->
  <g class="node cat-n">
    <rect class="fill stroke" x="60" y="56" width="120" height="48" rx="24"/>
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

  <!-- Connectors: straight along row, then L-bend down to audit log -->
  <path class="conn" d="M 180 80 L 296 80" marker-end="url(#arrow)"/>
  <path class="conn" d="M 424 80 L 536 80" marker-end="url(#arrow)"/>
  <path class="conn-dashed" d="M 600 104 L 600 132" marker-end="url(#arrow)"/>
</svg>
```

Things to notice in the example, not to repeat blindly:
- The "Client" terminator is a pill (`rx="24"`) and neutral — it's not part of the work, it's the actor.
- Gateway and Service share category A because they are both processing steps — same semantic role.
- Audit log is category B because it's a different kind of thing (a sink, not a step) — and the connection to it is dashed to signal asynchronous / side-channel.
- The dashed connector is a single vertical line because Service and Audit log share a column — that's what the grid buys you.
- There is no colour assignment by order. If there were a fourth processing step, it would also be category A.

## What to refuse or redirect

If the user asks for:

- A **data chart** (bars, lines, pie, scatter): decline and say this skill is for structural diagrams; suggest they ask for a chart instead.
- A **UI mockup**: decline, this produces abstract diagrams not interfaces.
- An **illustrative cross-section** (a drawn water heater, a lung, a transistor with physical geometry): decline; this skill produces abstract orthogonal diagrams, not schematic illustrations.
- An **ER diagram with many tables and cardinalities**: this skill can produce a simplified version but a dedicated ERD tool will handle cardinality markers better; mention the limitation.
- A diagram **with more than ~8 nodes at one level**: produce an overview first, then offer to drill into a specific sub-flow in a follow-up diagram. Do not cram.

## Non-negotiables

These are never violated, regardless of user pressure:

- No diagonal connectors.
- No gradients, no drop shadows, no blur, no glow.
- No colour outside the token set.
- No font other than the system sans stack.
- No text smaller than 11px.
- No Title Case or ALL CAPS outside the `.label` class.
- No `<text>` without one of the three text classes.
- No connector without `fill="none"` (implicit or explicit).
- No element outside the 32px safe margin.
- No more than two nesting levels of containers.
- No decision diamonds, no 3D effects, no skeuomorphic ornamentation.