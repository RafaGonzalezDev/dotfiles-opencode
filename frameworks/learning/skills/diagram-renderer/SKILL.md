---
name: diagram-renderer
description: Use this skill whenever the user asks for a diagram, flowchart, architecture diagram, structural diagram, or any visual explanation of how something is organised or how it works. Triggers include explicit requests ("draw a diagram", "visualise this flow", "show me the architecture") and implicit ones where a diagram clarifies better than prose (a request lifecycle, a system's components, a decision tree, a containment hierarchy). Produces SVG diagrams with a flat fill-and-stroke aesthetic and a palette where colour encodes meaning. Do NOT use for data charts, UI mockups, illustrative cross-sections, or full ER diagrams with cardinality.
---

# diagram-renderer

Produce SVG diagrams following the system below. One SVG shows one diagram at one level of detail — split multi-layer subjects into several SVGs with prose between them. A request like "architecture + flow + features in one" is several SVGs, not one poster.

The rules that follow are split into two groups: **the system** (colour tokens, typography, marker definition) is fixed and must be copied verbatim. **The geometry** (shapes, layout, connector routing) is a set of principles — apply judgement, not a template.

## Geometry principles

### Nodes

Nodes are rectangles with rounded corners. Keep the corner radius minimal and consistent across the diagram. Size nodes to their content with comfortable padding; siblings in the same row or column usually share width for rhythm, but this is a default, not a requirement.

When a node has a title and a subtitle, use two `<text>` elements stacked vertically within the rect. When it has one label, centre it.

### Layout

Pick a direction that matches the subject: flows read top-to-bottom or left-to-right, trees put parents above children, layered architectures stack actors-core-infrastructure, containment nests largest-outside.

Place nodes on an implicit grid: choose column centres and row centres first, then position nodes on those intersections. This is what makes connectors land cleanly. Leave enough breathing room between nodes that connectors have space to route — if in doubt, add more.

### Connectors

Connectors are orthogonal by default: horizontal and vertical segments joined at right angles. Diagonals are reserved for cases where an orthogonal path would be contrived (e.g. a radial diagram, a genuinely non-grid layout).

Solid lines for direct relationships, dashed for indirect, async, or optional ones. Every connector ends in an arrowhead via `marker-end="url(#arrow)"`.

**Endpoints land on node edges, never in empty space and never inside a node's fill.** The four natural endpoints on a rect `(x, y, w, h)` are the midpoints of each edge: top `(x + w/2, y)`, bottom `(x + w/2, y + h)`, left `(x, y + h/2)`, right `(x + w, y + h/2)`. Use these unless you have a specific reason to offset (e.g. multiple connectors fanning out from the same node).

**Connectors never cross a third node.** If the direct path would, route around with an extra bend. Connectors may cross each other when unavoidable, but minimise it.

For orthogonal paths, each `L` segment changes exactly one coordinate — either x or y, never both. A segment that changes both is a diagonal; if you intend a diagonal, be deliberate about it.

### Containers

Use a dashed, unfilled rectangle to group related nodes. Label the group with a small uppercase label in the top-left. Leave generous padding between the container border and its children. Avoid nesting more than two levels deep.

## Colour

Colour encodes role, not order. Nodes that do the same kind of work share a ramp. A node's ramp changes when its role changes, not when its position does.

Ramps available: `cat-a` (primary), `cat-b` (secondary/counterpart), `cat-c` (tertiary), `cat-n` (neutral — for actors, structural elements, anything without a semantic role), `cat-warn`, `cat-err`. Use warn/err only for nodes that genuinely represent warning or error states.

Favour restraint: most diagrams need two or three ramps plus neutral. Using every available colour dilutes the encoding.

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

Canvas width typically 720–880; height is whatever the content needs plus a comfortable bottom margin. Background transparent. Keep a safe margin around the content on all sides.

Text in the diagram follows the user's language; identifiers like `index.ts` stay in native form.

Paint containers first, then connectors, then nodes, so the node fills terminate connectors cleanly at the edge.

### Style block

Copy this block verbatim. It defines the entire palette and typography — three text sizes (14/12/11px), two weights (400/500), sentence case. Don't introduce colours, fonts, or stroke widths outside it, and don't use inline `style="..."` on text.

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

The `cat-X` class applies colour only through child classes `.fill` and `.stroke`. A bare `cat-X` on a rect renders black — always include the child classes.

## Element patterns

Use these as reference, not as templates to paste. Adjust dimensions to the content.

Node:

```
<g class="node cat-a">
  <rect class="fill stroke" x="..." y="..." width="..." height="..." rx="6"/>
  <text class="t ink" x="cx" y="cy" text-anchor="middle" dominant-baseline="central">Label</text>
</g>
```

Two-line node: two `<text>` elements, title with `class="t ink"` slightly above centre, subtitle with `class="ts ink"` slightly below.

Container:

```
<rect x="..." y="..." width="..." height="..." rx="10"
      fill="none" stroke="var(--line)" stroke-dasharray="4 4"/>
<text class="label" x="..." y="...">Section name</text>
```

Legend entry (include only when the mapping isn't already obvious from the labels):

```
<g class="cat-a">
  <rect class="fill stroke" x="..." y="..." width="12" height="12" rx="3"/>
</g>
<text class="ts" x="..." y="..." dominant-baseline="central">Category name</text>
```

## Minimal example

Three processing nodes, one neutral actor, one side-channel sink. Categories A and N repeat because Gateway and Service share a role, and Client is a plain actor. The dashed connector to Audit log is a single vertical segment because the target sits directly below the source — the grid earns that.

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