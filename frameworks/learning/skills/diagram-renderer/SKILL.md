---
name: diagram-renderer
description: Use this skill whenever the user asks for a diagram, flowchart, architecture diagram, structural diagram, or any visual explanation of how something is organised or how it works. Triggers include explicit requests ("draw a diagram", "visualise this flow", "show me the architecture") and implicit ones where a diagram clarifies better than prose (a request lifecycle, a system's components, a decision tree, a containment hierarchy). Produces SVG diagrams with orthogonal connectors, rounded rectangular nodes, two-weight typography, a flat fill-and-stroke aesthetic, and a palette where colour encodes meaning. Only nodes carry backgrounds; containers, legends, and the canvas are transparent. Do NOT use for data charts, UI mockups, illustrative cross-sections, or full ER diagrams with cardinality.
---

# diagram-renderer

Produce SVG diagrams following the system below. One SVG shows one diagram at one level of detail — split multi-layer subjects into several SVGs with prose between them. A request like "architecture + flow + features in one" is several SVGs, not one poster.

## Shapes and layout

- Nodes are rounded rectangles, `rx="6"`, always. No pills, circles, hexagons, or diamonds. Decisions are a node plus two outgoing connectors labelled "yes"/"no".
- Single-line node: height 48. Two-line (title + subtitle): height 60. Width = max(120, longest text + 32).
- Place nodes on a grid: pick column centres and row centres first, then position nodes on intersections. Siblings in a row share width.
- Spacing: ≥32px between siblings, ≥48px between rows/columns.
- Layout defaults: flows top-to-bottom; trees top-to-bottom with parent above children; architectures layered (actors top/left, core middle, infra bottom/right); containment nested largest-outside.

## Connectors

All connectors are `<path class="conn"` or `class="conn-dashed"` with `marker-end="url(#arrow)"`. Solid for direct relationships, dashed for indirect/async/optional.

Connector shapes — exactly these three forms, nothing else:

- Straight vertical: `M x,y1 L x,y2`
- Straight horizontal: `M x1,y L x2,y`
- L-bend: `M x1,y1 L xb,y1 L xb,y2 L x2,y2` (horizontal first) or `M x1,y1 L x1,yb L x2,yb L x2,y2` (vertical first)

Every `L` command matches its predecessor in either x or y. Two coordinates never change in the same segment — that would be a diagonal.

Endpoints are always one of these four points on a node's rect `(x, y, w, h)`:

- Top edge: `(x + w/2, y)`
- Bottom edge: `(x + w/2, y + h)`
- Left edge: `(x, y + h/2)`
- Right edge: `(x + w, y + h/2)`

A connector's first point and last point are both node-edge points. Endpoints never land in empty space, and they never sit inside a node's fill.

If the direct path between two endpoints would cross a third node, route around it with a U-bend (two bends, three segments).

## Colour

At most three accent ramps per diagram. Nodes sharing a semantic role share a ramp. Structural and actor nodes use `cat-n` (neutral). Semantic ramps (`cat-warn`, `cat-err`) only when the node represents warning or error state.

Assign by role, never by order. Five processing steps that do the same kind of work all take the same ramp. A node's ramp changes only when its role changes.

Categories: `cat-a` primary work, `cat-b` secondary/counterpart, `cat-c` third (rare), `cat-n` neutral, `cat-warn`, `cat-err`.

## Canvas and tokens

```
<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 W H" role="img">
  <title>...</title><desc>...</desc>
  <defs>
    <style>/* tokens below */</style>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1,1 L9,5 L1,9" fill="none" stroke="context-stroke"
            stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <!-- containers, connectors, nodes -->
</svg>
```

`W` is 720–880. `H` = bottom edge of the lowest element + 32px. Background transparent. 32px safe margin on all sides. Text in the diagram follows the user's language; identifiers like `index.ts` stay in native form.

Paint order inside the SVG: containers → connectors → nodes. Nodes last so their rects terminate connectors cleanly at the edge.

Style block (the entire palette and typography):

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

Three text sizes (14/12/11px), two weights (400/500), sentence case. No colours, fonts, or stroke widths outside this block. No inline `style="..."` on text.

## Element patterns

Node:

```
<g class="node cat-a">
  <rect class="fill stroke" x="..." y="..." width="..." height="48" rx="6"/>
  <text class="t ink" x="cx" y="cy" text-anchor="middle" dominant-baseline="central">Label</text>
</g>
```

For a two-line node, use two `<text>` elements: title at `y = cy - 8` with `class="t ink"`, subtitle at `y = cy + 9` with `class="ts ink"`.

Container (groups nodes visually, no fill):

```
<rect x="..." y="..." width="..." height="..." rx="10"
      fill="none" stroke="var(--line)" stroke-dasharray="4 4"/>
<text class="label" x="container_x + 14" y="container_y + 20">Section name</text>
```

Padding inside a container: ≥24px between its border and any child. Maximum two nesting levels.

Legend entry (no surrounding background, no border):

```
<g class="cat-a">
  <rect class="fill stroke" x="..." y="..." width="12" height="12" rx="3"/>
</g>
<text class="ts" x="swatch_x + 18" y="swatch_y + 6" dominant-baseline="central">Category name</text>
```

Note: the `cat-X` class applies colour only through child classes `.fill` and `.stroke`. A bare `cat-X` on a rect renders black.

Legends are optional. Include one only when the category mapping is not obvious from the node labels themselves.

## Minimal example

Three processing nodes, one neutral actor, one side-channel sink. Category A repeats because Gateway and Service share a role. The dashed connector to Audit log is a single vertical line because the target sits directly below the source — the grid earns that.

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
<path class="conn" d="M 180,80 L 296,80" marker-end="url(#arrow)"/>
<path class="conn" d="M 424,80 L 536,80" marker-end="url(#arrow)"/>
<path class="conn-dashed" d="M 600,104 L 600,132" marker-end="url(#arrow)"/>
```

## Out of scope

Data charts, UI mockups, illustrative cross-sections, and full ERDs with cardinality markers: decline, wrong skill. Single-SVG posters that cover multiple levels of detail: decline and produce several focused SVGs instead.