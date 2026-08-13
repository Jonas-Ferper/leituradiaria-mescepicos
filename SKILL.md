---
name: site-liturgia
description: Design, build, validate, and evolve the frontend of Site Liturgia, an independent Catholic liturgical website that consumes JSON data produced by the Calendário Litúrgico Perpétuo (CLP). Use this skill for UI/UX design, frontend implementation, redesigns, refactoring, responsive behavior, accessibility, visual validation, navigation, calendars, liturgical-day views, readings, and presentation of CLP data.
---

# Site Liturgia — Advanced UI/UX & Frontend Skill

## 1. Mission & Technology Stack

Build a clear, accessible, fast, and breathtakingly beautiful Catholic liturgical website.

The interface must transform structured JSON from the Calendário Litúrgico Perpétuo (CLP) into a serene, intuitive, readable, and trustworthy user experience.

### Mandatory technology stack

- **Framework:** Next.js, App Router preferred.
- **Language:** TypeScript with strict typing.
- **Styling:** Tailwind CSS.
- **Components:** shadcn/ui primitives, customized for the Site Liturgia visual identity.
- **Validation:** project build/test tooling plus Chromium/Playwright when available.

The Site Liturgia is strictly a **presentation and experience layer**.

It must never calculate its own liturgical data.

### Important migration rule

If the existing project is already based on another framework, such as Vite, do not migrate it to Next.js merely because Next.js is preferred.

Before changing the framework:

1. inspect the current project;
2. understand its architecture;
3. determine whether migration is explicitly requested;
4. preserve existing functionality;
5. migrate deliberately when migration is part of the task.

If a new Site Liturgia application is being created from scratch, use Next.js + TypeScript + Tailwind + shadcn/ui.

---

## 2. Fundamental Architecture

Maintain this conceptual boundary:

```text
CLP
│
├── computes liturgical data
├── defines canonical data
└── produces JSON
        │
        ▼
Site Liturgia
│
├── consumes JSON
├── validates/parses data
├── normalizes data for presentation
├── organizes information
├── provides navigation
├── renders the interface
└── validates the rendered experience
```

The frontend is not the CLP.

The CLP is responsible for liturgical computation and canonical correctness.

Site Liturgia is responsible for:

- presentation;
- information hierarchy;
- navigation;
- accessibility;
- responsive behavior;
- interaction;
- visual identity;
- user experience.

Never duplicate the CLP engine in the frontend.

---

## 3. Source of Truth — CLP JSON

Treat the JSON supplied by the CLP as the source of truth.

The frontend may parse and normalize the data for presentation, but must never silently alter its semantic meaning.

Never invent:

- celebrations;
- readings;
- biblical references;
- liturgical colors;
- ranks;
- categories;
- cycles;
- liturgical seasons;
- canonical keys;
- liturgical years.

If information is missing, present an honest empty state.

Example:

> A liturgia deste dia ainda não está publicada.

Do not fabricate plausible content to fill visual gaps.

If the source appears inconsistent, preserve the source value and report the issue rather than silently correcting it in the frontend.

---

## 4. CLP Independence

The frontend must never implement or duplicate:

- Easter computation;
- liturgical-year calculation;
- precedence rules;
- transfer rules;
- canonical-key generation;
- celebration assignment;
- reading assignment;
- liturgical cycle calculation.

Date arithmetic for **navigation** is allowed.

For example:

```text
diaAnterior(date)
diaSeguinte(date)
```

may calculate the adjacent civil date, but must not calculate the liturgical meaning of that date.

---

## 5. JSON Contract & Type Safety

Create a single typed data model for the CLP JSON.

Use strict TypeScript.

Example:

```ts
interface LiturgicalDay {
  date: string;
  celebration: string;
  secondaryCelebrations?: string[];
  grade?: string;
  season?: string;
  colors?: string[];
  rank?: string;
  dominicalCycle?: string;
  ferialCycle?: string;
  canonicalKey?: string;
  liturgicalYear?: string;
  readings?: Reading[];
}

interface Reading {
  type: string;
  reference: string;
  text?: string;
}
```

This is an example only. Adapt the interfaces to the actual JSON contract found in the project.

Do not duplicate the same JSON structure across multiple components.

Centralize:

```text
JSON
 ↓
parser
 ↓
validation
 ↓
normalization
 ↓
UI model
 ↓
components
```

Use clean typed props for visual components.

---

## 6. Existing Project First

Before implementing any UI task:

1. Inspect the repository.
2. Identify the actual framework.
3. Inspect `package.json`.
4. Inspect the build configuration.
5. Inspect the existing component architecture.
6. Inspect data loading.
7. Inspect representative CLP JSON files.
8. Run the current application.
9. Understand what already works.
10. Identify reusable components and patterns.
11. Only then implement the requested change.

Do not blindly replace an existing application.

Do not migrate Vite to Next.js unless migration is explicitly requested or clearly required by the current project direction.

---

## 7. Aesthetic Philosophy — Contemplative Minimalism

The interface should feel:

- Catholic;
- serene;
- modern;
- trustworthy;
- elegant;
- readable;
- contemplative;
- purposeful.

The design should communicate:

**peace, clarity, reverence, and confidence.**

Avoid generic SaaS aesthetics.

Avoid visual noise.

Liturgical beauty should come primarily from:

- hierarchy;
- typography;
- whitespace;
- rhythm;
- restrained color;
- subtle borders;
- meaningful imagery;
- coherent iconography;
- excellent composition.

Do not add visual effects merely to make a screenshot look impressive.

---

## 8. Typography

Use a restrained typographic system.

A serif/sans-serif pairing is encouraged:

### Serif

For:

- liturgical headings;
- solemn celebrations;
- reading content;
- selected editorial moments.

Possible families:

- Playfair Display;
- Lora;
- Merriweather;
- another appropriate serif.

### Sans-serif

For:

- navigation;
- controls;
- metadata;
- badges;
- interface labels.

Possible families:

- Inter;
- Geist;
- Roboto;
- another appropriate sans-serif.

The exact fonts should be selected according to:

- readability;
- performance;
- licensing;
- availability;
- visual coherence.

Avoid excessive font families.

---

## 9. Whitespace

Treat whitespace as a primary design element.

Prefer generous and intentional spacing:

```text
gap-8
p-6
space-y-12
```

Use spacing to create:

- calm;
- hierarchy;
- separation;
- reading rhythm.

Do not fill empty space merely because it exists.

---

## 10. Borders, Surfaces & Shadows

Avoid heavy boxes and harsh shadows.

Prefer:

- subtle borders;
- soft rounded corners;
- restrained surfaces;
- diffuse low-opacity shadows.

Examples:

```text
border-border/50
rounded-xl
rounded-2xl
```

Do not turn every element into a card.

Cards should group meaningful information.

---

## 11. Anti-Generic-AI Design Rule

Do not automatically produce:

- excessive glassmorphism;
- arbitrary gradients;
- decorative blobs;
- oversized hero sections;
- excessive rounded cards;
- excessive shadows;
- random colored badges;
- unnecessary charts;
- meaningless dashboard statistics;
- excessive animation;
- visual noise.

Every visual element must have a purpose.

The result must look intentionally designed for a Catholic liturgical product, not like a generic AI-generated SaaS dashboard.

---

## 12. Primary User Journey & Fundamental Interface Architecture

The **calendar is the central architectural principle of Site Liturgia**.

The initial interface is not a generic dashboard, landing page, or search portal.

It is a liturgical calendar that gives immediate access to every day of the current month.

The fundamental experience is:

```text
see current month
      ↓
select a day
      ↓
see liturgical information
      ↓
open the readings
```

The primary screen must be organized around two columns:

```text
┌───────────────────────┬─────────────────────────────────────────┐
│                       │                                         │
│   MONTH CALENDAR      │   LITURGICAL INFORMATION                │
│                       │                                         │
│   current month       │   selected day                          │
│   selectable days     │   celebration / season / color / grade │
│                       │                                         │
│                       │   READINGS OF THE DAY                   │
│                       │                                         │
│                       │   First Reading       [expand/collapse] │
│                       │   Psalm               [expand/collapse] │
│                       │   Gospel              [expand/collapse] │
│                       │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

### Left column — Calendar

The left side contains the calendar of the current month.

It must provide direct access to every available day of that month.

The calendar is:

- the principal navigation mechanism;
- the primary visual anchor;
- the entry point to the site's content;
- the mechanism for selecting the day shown on the right.

Do not hide the current month's calendar behind another screen.

### Right column — Selected Day

The right side reacts to the selected calendar day.

It contains exactly two primary information areas:

1. **Liturgical information**
2. **Readings of the day**

Liturgical information appears above the readings.

The selected day should remain visually obvious in the calendar.

### No Home Tab

There is no separate "Home" or "Início" tab.

The calendar itself is the initial and principal screen.

Do not create a redundant home route merely to display the same calendar.

### No Search Field

Do not add a search field.

The primary discovery mechanism is the calendar.

Search may only be introduced if a future requirement explicitly changes this product direction.

### Months Are Hidden by Default

Available months must not occupy permanent screen space.

The calendar header should display the current month and year, for example:

```text
‹        AGOSTO 2026        ›
```

The month/year label is interactive.

Only when the user clicks/taps the month/year in the calendar header should the interface reveal the available months.

The month selector should remain contextual and unobtrusive.

Do not display a permanent month sidebar, month grid, or month navigation panel unless explicitly requested.

### Day Selection

Selecting a day must update the right-hand content without forcing the user through a separate navigation workflow.

The user should be able to move through the month by:

- selecting a date;
- using previous/next month controls;
- opening the contextual month selector.

### Readings Are Expandable Cards

Each reading is an independent expandable/collapsible card.

Examples:

```text
┌─────────────────────────────────────────────┐
│ Primeira Leitura       Is 43,18-25       ˅ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Salmo                  Sl 40(41)          ˅ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Evangelho              Mt 18,15-20        ˅ │
└─────────────────────────────────────────────┘
```

When closed, the card provides enough information to identify the reading.

When opened, it reveals the available content supplied by the source JSON.

Do not force every reading to remain expanded.

The user controls the reading experience.

### Liturgical Information Is Also Collapsible

The liturgical-information section may be presented as an expandable card or compact expandable panel.

It should initially communicate the essential context without overwhelming the interface.

Possible information includes:

- date;
- weekday;
- celebration;
- liturgical season;
- liturgical color;
- grade/category;
- cycles;
- secondary celebrations.

Technical metadata should remain secondary.

### The Primary Interaction Model

The interaction hierarchy is:

```text
CALENDAR
   ↓
DAY
   ↓
LITURGICAL INFORMATION
   ↓
READINGS
   ↓
EXPAND / COLLAPSE
```

This hierarchy must guide future interface decisions.

Do not introduce competing primary navigation systems.

## 13. Home / Initial Screen

The initial screen is the calendar interface defined in Section 12.

Do not treat Site Liturgia as a conventional dashboard.

The calendar is the home experience.

The interface must not begin with:

- a marketing hero;
- a dashboard metrics grid;
- a large `HojeCard`;
- a search interface;
- a separate welcome page.

The selected day may be the current civil day by default, but the calendar remains the primary visual and navigational element.

## 14. Today / Current Day

The current civil day may be selected automatically when the site opens.

This does not turn the current day into a separate dashboard.

Do not make `HojeCard` the dominant architectural element.

If a `HojeCard` component is retained, it must behave as a compact contextual component inside the calendar-based interface and must never compete with the calendar as the primary navigation surface.

The essential behavior is:

```text
open Site Liturgia
      ↓
current month is visible
      ↓
current day may be selected
      ↓
right column shows its information and readings
```

The user must remain free to select any other day immediately.

---

## 15. Monthly Calendar

The monthly calendar must balance density and meaning.

Do not attempt to display every JSON field inside a calendar cell.

Use the calendar to answer:

**What is happening on this day?**

Use the day-detail page to answer:

**What exactly is happening on this day?**

### Visual hierarchy

At minimum distinguish:

#### Sundays

Use restrained emphasis such as:

- stronger date number;
- subtle gold accent;
- slight elevation;
- increased typographic weight.

#### Solemnities

Use stronger emphasis such as:

- gold border/accent;
- stronger celebration name;
- increased visual hierarchy.

#### Feasts

Use intermediate emphasis.

#### Memorials

Use clear but restrained emphasis.

#### Weekdays/Ferial days

Use quieter presentation.

Do not make every category visually equivalent.

---

## 16. Mobile Calendar

On narrow screens:

- preserve the date number;
- preserve a touch target of at least 44×44px;
- simplify secondary text;
- avoid clipping;
- avoid horizontal overflow;
- allow the day-detail view to carry complete information.

At very narrow widths, celebration names may be hidden from calendar cells if the selected day/detail view preserves complete access.

Never sacrifice usability merely to keep every piece of text visible in a small cell.

---

## 17. Day Detail

The day-detail view is a central experience.

Present information in a clear hierarchy:

1. date;
2. weekday;
3. liturgical season;
4. celebration;
5. category/grade;
6. liturgical color;
7. cycles when relevant;
8. readings;
9. secondary celebrations when relevant.

The page should feel focused rather than overloaded.

---

## 18. Readings Experience

Present readings as structured liturgical content.

Separate clearly:

- First Reading;
- Psalm;
- Second Reading, when applicable;
- Gospel;
- other supplied liturgical references.

Example:

```text
PRIMEIRA LEITURA

Ez 9,1-7; 10,18-22
```

Do not expose raw JSON structure to users.

If the JSON contains only a reference, show the reference.

Do not fabricate biblical text.

If authorized biblical text is supplied, present it with excellent reading typography.

Use:

- `max-w-prose` or equivalent;
- generous line-height;
- comfortable measure;
- paragraph rhythm;
- clear section separation.

The reading experience should support both quick scanning and contemplative reading.

---

## 19. Biblical Text vs. Reference

Always distinguish between:

### Reference

Example:

```text
Mt 18,15-20
```

### Biblical text

The actual passage, only when supplied by an authorized source.

Never assume that a reference automatically authorizes reproducing the complete text.

Never fabricate text from memory.

---

## 20. Liturgical Color System

When the JSON provides a liturgical color such as:

- white;
- red;
- green;
- violet;
- rose;
- black;

use it as a semantic accent.

Do not use it as an overwhelming full-screen background.

Map semantic colors to design tokens, for example:

```text
text-liturgy-red
bg-liturgy-violet/10
```

### Contrast

Maintain WCAG AA contrast where applicable.

### Explicit labeling

Always accompany color accents with text.

For example:

```text
● Verde
```

is preferable to communicating "Verde" only through color.

Color must never be the sole source of meaning.

---

## 21. Liturgical Badges

Create reusable semantic components such as:

- `LiturgicalBadge`;
- `SeloLitúrgico`;
- `SeloTempo`;
- `SeasonBadge`;
- `LiturgicalColorBadge`;
- `GradeBadge`.

A badge must communicate information quickly.

It must not become decorative noise.

Use consistent visual language across:

- Home;
- Calendar;
- Day Detail;
- Reading context.

---

## 22. Component Architecture

Use modular, reusable components.

Recommended components may include:

- `HojeCard`;
- `LiturgicalHeader`;
- `LiturgicalCalendar`;
- `CalendarDay`;
- `LiturgicalBadge`;
- `SeloLitúrgico`;
- `SeloTempo`;
- `CelebrationCard`;
- `ReadingCard`;
- `ReadingSection`;
- `DateNavigator`;
- `MonthNavigator`;
- `YearSelector`;
- `EmptyState`;
- `LoadingState`;
- `ErrorState`.

Use existing project components when they already solve the problem.

Do not introduce a new component system without inspecting the current architecture.

---

## 23. shadcn/ui

Use shadcn/ui as an accessible primitive layer, not as the site's visual identity.

Customize components to fit Site Liturgia.

Use shadcn/ui where it provides meaningful value for:

- buttons;
- badges;
- dialogs;
- sheets;
- dropdowns;
- calendars;
- skeletons;
- tooltips;
- navigation primitives.

Do not mechanically wrap every element in a shadcn component.

---

## 24. Component Responsibilities

Components should have clear responsibilities.

Avoid components that simultaneously:

- fetch all application data;
- calculate unrelated information;
- render multiple pages;
- contain duplicated presentation logic.

Prefer:

```text
data loading
    ↓
normalization
    ↓
application state
    ↓
typed props
    ↓
presentation components
```

Purely visual components should receive clean typed props.

---

## 25. Navigation

Navigation should make movement through time effortless.

Support when appropriate:

- previous day;
- next day;
- today;
- previous month;
- next month;
- month selection;
- year selection;
- direct date selection.

Do not force users to return to Home to change dates.

---

## 26. Cross-Month and Cross-Year Navigation

Date navigation must cross month and year boundaries correctly.

Important cases:

```text
31/08/2026 → 01/09/2026
31/12/2026 → 01/01/2027
01/01/2027 → 31/12/2026
```

Navigation logic must be centralized in reusable utilities.

For example:

```ts
diaAnterior(date)
diaSeguinte(date)
```

Do not duplicate date arithmetic inside React components.

The frontend may calculate civil-date adjacency for navigation.

It must not calculate the liturgical meaning of the adjacent date.

---

## 27. "Hoje" Action

Provide a low-friction `Hoje` action where useful, including:

- month pages;
- day pages;
- primary navigation/masthead.

The user must always have a clear way to return to the current civil date.

If already viewing today, the action may be visually muted or disabled according to the design system.

---

## 28. URL State

When the project architecture permits it, important navigation state should be represented in the URL.

Examples:

```text
/2026/08/12
/2026/08
```

URL state should support:

- direct access;
- browser refresh;
- back/forward navigation;
- sharing;
- reproducibility.

Do not impose a URL architecture blindly; inspect the existing routing model first.

---

## 29. Loading States

Avoid abrupt layout shifts.

Use shadcn/ui `Skeleton` or equivalent components.

Skeletons should mimic the exact geometry of the final interface.

### Monthly calendar

The skeleton should reflect:

- the correct weekday offset;
- the actual number of days;
- the final grid structure.

### Day detail

The skeleton should resemble:

- title;
- metadata;
- celebration;
- readings sections.

### Home

The skeleton should resemble the final `HojeCard` composition.

Do not use generic rectangles when a more faithful skeleton is practical.

---

## 30. Empty States

Empty states must be honest and calm.

Example:

> A liturgia deste dia ainda não está publicada.

Do not:

- invent content;
- display misleading placeholders;
- imply that data exist when they do not.

An empty state is part of the product design, not an error to hide.

---

## 31. Error States

Errors should be understandable to ordinary users.

Do not expose raw stack traces or technical exceptions as the primary interface.

Technical information may be logged for developers.

The user-facing message should explain:

- what failed;
- what the user can do next, when applicable.

---

## 32. Responsive Design

The interface must be flawless on mobile.

Use fluid responsive utilities such as:

```text
text-base md:text-lg
flex-col md:flex-row
```

when appropriate.

Touch targets must be at least 44×44px.

Avoid cramped horizontal scrolling.

Use CSS Grid and Flexbox to reorganize content rather than simply stretching mobile cards.

Desktop layouts should expand gracefully.

---

## 33. Accessibility

Accessibility is mandatory.

Ensure:

- semantic HTML;
- keyboard navigation;
- visible focus states;
- sufficient color contrast;
- accessible labels;
- logical heading hierarchy;
- meaningful button/link semantics;
- practical touch targets;
- appropriate ARIA only when necessary.

Every icon-only interactive element must have an accessible name.

Never use color as the only information channel.

---

## 34. Interaction & Motion

Use subtle transitions for:

- navigation;
- selection;
- expansion;
- hover;
- focus;
- dialog appearance.

A reasonable default may be:

```text
transition-all duration-300 ease-in-out
```

but do not apply animation mechanically to every element.

Motion must:

- communicate state;
- reinforce orientation;
- improve perceived continuity.

Avoid animation that competes with liturgical content.

Respect reduced-motion preferences.

---

## 35. Icons

Use a consistent icon library or the project's established icon system.

Do not mix arbitrary icon styles.

Icons should reinforce meaning.

Do not use icons merely as decoration when they add no information.

---

## 36. Imagery

Images may strengthen the site's identity.

When used:

- choose imagery appropriate to the liturgical context;
- avoid generic corporate stock photography;
- preserve performance;
- use coherent aspect ratios;
- provide meaningful alternative text when informative.

Decorative imagery should not interfere with content.

The site should remain visually complete even when no image is available.

---

## 37. Cards

Cards are useful for grouping meaningful information.

Do not turn every piece of content into a card.

Use cards when they improve:

- grouping;
- scanning;
- hierarchy;
- interaction.

The `HojeCard` may be a focal card, but it should not become an oversized marketing hero.

---

## 38. Technical Metadata

Canonical keys and internal metadata are useful for technical integrity but are not primary user-facing content.

Do not prominently expose:

- canonical keys;
- internal identifiers;
- raw JSON properties;
- implementation details.

Use a `<details>` section or developer/debug mode when technical information needs to be visible.

---

## 39. Search & Discovery

If search is implemented, it should help users find:

- dates;
- celebrations;
- months;
- readings;
- liturgical days.

Search results should preserve liturgical context.

Do not make search results look like generic database records.

---

## 40. Data Loading & Scalability

The application should load monthly JSON data according to the existing architecture.

Do not hard-code a fixed set of months as a permanent architectural assumption.

A future file such as:

```text
clp-2027-02.json
```

should be treated as another data source.

Adding new months should not require redesigning the interface.

---

## 41. Missing Optional Data

The UI must tolerate:

- missing readings;
- missing secondary celebrations;
- missing images;
- missing optional metadata;
- unavailable months;
- unavailable years.

Use:

- graceful omission;
- informative empty states;
- disabled navigation where appropriate.

Never fabricate content.

---

## 42. Performance

Prefer:

- small bundles;
- efficient JSON loading;
- image optimization;
- lazy loading where beneficial;
- minimal unnecessary dependencies;
- server components where appropriate in Next.js;
- client components only where interactivity requires them.

Do not introduce complexity for theoretical performance gains.

Avoid premature optimization.

---

## 43. Next.js Architecture

When using Next.js:

Prefer the App Router.

Use Server Components by default.

Use Client Components only when the component needs:

- browser state;
- event handlers;
- client-side interaction;
- browser APIs.

Keep data fetching as close as practical to the server boundary.

Do not turn the entire application into a Client Component unnecessarily.

---

## 44. Tailwind & Design Tokens

Use Tailwind utility classes with semantic design tokens.

Prefer:

```text
bg-background
text-foreground
text-muted-foreground
border-border
bg-muted
```

and custom semantic liturgical tokens such as:

```text
text-liturgy-red
bg-liturgy-violet/10
```

over arbitrary hard-coded values.

Arbitrary values are acceptable only when they have a clear design reason and cannot reasonably be represented by the design system.

---

## 45. Design System

Maintain a coherent design system for:

- typography;
- spacing;
- surfaces;
- borders;
- radii;
- shadows;
- semantic colors;
- liturgical colors;
- focus states;
- hover states;
- responsive breakpoints.

Do not repeatedly invent slightly different values.

---

## 46. Catholic Visual Identity

Catholic identity should be communicated with restraint.

Potential visual language:

- dignified typography;
- liturgical color accents;
- contemplative whitespace;
- subtle ecclesial motifs;
- sacred architectural proportions;
- restrained imagery;
- traditional references interpreted through contemporary design.

Do not overload the interface with:

- crosses;
- halos;
- church silhouettes;
- decorative religious icons;
- ornamental frames.

The interface should feel Catholic without becoming visually theatrical.

---

## 47. Celebration Hierarchy

Liturgical importance should have consistent visual hierarchy.

At minimum:

### Solemnity

Strongest emphasis.

Possible treatments:

- accent border;
- stronger typography;
- restrained gold;
- increased spacing.

### Feast

Intermediate emphasis.

### Memorial

Clear but restrained emphasis.

### Weekday/Ferial

Quiet presentation.

Do not make all celebrations visually identical.

Do not invent categories not supplied by the source data.

---

## 48. Content Hierarchy

Always distinguish:

### Primary

- date;
- celebration;
- main liturgical context.

### Secondary

- season;
- grade;
- color;
- cycles;
- secondary celebrations.

### Tertiary

- canonical key;
- internal metadata;
- technical identifiers.

Technical information should not compete with liturgical information.

---

## 49. Browser Experience

The site must behave correctly with:

- direct URL access;
- refresh;
- browser back/forward;
- mobile browsers;
- desktop browsers.

Avoid interactions that depend exclusively on one navigation path.

---

## 50. Development Workflow

Before modifying the interface:

1. Inspect the current project.
2. Understand its framework and architecture.
3. Inspect components.
4. Inspect data loading.
5. Inspect representative JSON.
6. Identify reusable patterns.
7. Define the intended visual hierarchy.
8. Plan the smallest coherent change.
9. Implement.
10. Run the build.
11. Test relevant routes and interactions.
12. Perform visual validation when browser tooling is available.
13. Check mobile and desktop.
14. Check console errors.
15. Correct discovered issues.
16. Run the final build again.

---

## 51. No Destructive Refactoring

Do not replace an existing application blindly.

Before major refactoring:

- inspect current files;
- understand dependencies;
- preserve working functionality;
- identify intentional behavior;
- make changes incrementally.

Do not rewrite the entire application for a localized UI request.

---

## 52. Production-Ready Code

Generated code must be production-ready.

Before delivery verify:

- TypeScript correctness;
- no avoidable console errors;
- no broken routes;
- no missing React list keys;
- no inaccessible icon-only controls;
- no unnecessary client-side state;
- no duplicated data models;
- no invented liturgical content;
- no obvious responsive overflow.

Run the project's available build and test commands.

---

## 53. Visual Validation

Functional correctness alone is insufficient for significant visual work.

When Chromium, Playwright, or another browser-rendering environment is available:

1. Start the application.
2. Render the affected route.
3. Test a mobile viewport.
4. Test a desktop viewport.
5. Capture screenshots when possible.
6. Inspect the actual rendered result for:
   - typography;
   - spacing;
   - alignment;
   - overflow;
   - clipping;
   - contrast;
   - hierarchy;
   - card proportions;
   - calendar density;
   - touch-target geometry;
   - responsive behavior;
   - visual consistency.
7. Correct visible issues.
8. Render again.

### Minimum routes for significant UI work

When relevant, inspect:

```text
/
monthly calendar
day detail
month boundary
year boundary
```

Do not claim visual validation if only DOM/CSS inspection was performed.

If screenshot generation or visual inspection is unavailable, explicitly report that limitation.

---

## 54. Functional Validation

After implementation, run the project's available checks.

At minimum, when supported:

```text
npm run build
```

Also test:

- application startup;
- relevant routes;
- current-day behavior;
- previous/next day;
- previous/next month;
- month boundaries;
- year boundaries;
- `Hoje` action;
- loading state;
- empty state;
- error state;
- responsive layout.

If browser automation is available, test the critical routes in Chromium/Playwright.

---

## 55. Critical Date Tests

When date navigation is changed, verify at least:

```text
31/08/2026 → 01/09/2026
31/12/2026 → 01/01/2027
01/01/2027 → 31/12/2026
```

Also test leap-year behavior when the application supports dates around February.

---

## 56. Visual Regression Awareness

When modifying a central component such as:

- header;
- calendar;
- `HojeCard`;
- reading card;
- navigation;
- design tokens;

check the pages that reuse it.

A local component change can affect multiple routes.

Prefer systemic fixes over route-specific patches when the problem is systemic.

---

## 57. User Intent Over Literal Implementation

When the user asks for a visual result, reason from the desired user experience rather than blindly implementing the literal wording.

For example:

> "Deixe o calendário mais bonito."

requires consideration of:

- hierarchy;
- spacing;
- typography;
- celebration emphasis;
- interaction;
- responsive behavior;
- current-day affordance;
- visual density.

Do not merely add colors or shadows.

---

## 58. Avoid Overengineering

Do not introduce:

- unnecessary state libraries;
- unnecessary dependencies;
- complex abstractions;
- premature design-system infrastructure;
- backend services;
- duplicated data engines;

when the existing application can solve the task simply.

Prefer the simplest implementation capable of producing a high-quality result.

---

## 59. Preserve Data Semantics

Never change the meaning of source data to make the UI easier.

If the JSON says one thing and the visual design seems to expect another:

- preserve the source semantics;
- adapt the presentation;
- report inconsistencies.

Do not silently "correct" CLP data in the frontend.

The CLP remains responsible for canonical liturgical correctness.

---

## 60. Debugging Rule

When a UI issue is found:

1. reproduce it;
2. identify whether it is data, state, navigation, CSS, rendering, or browser behavior;
3. fix the appropriate layer;
4. avoid workarounds in unrelated components;
5. rerun relevant tests.

Do not hide data problems with presentation hacks.

---

## 61. Mobile Interaction Safety

Do not assume that desktop interactions work on touch devices.

Verify:

- tap targets;
- scrolling;
- sticky headers;
- horizontal overflow;
- dialogs;
- sheets;
- dropdowns;
- calendar selection;
- navigation controls.

If a desktop interaction has no good mobile equivalent, redesign it.

---

## 62. The Site Is a Liturgical Product

Do not treat Site Liturgia as merely a JSON viewer.

It is a complete user-facing liturgical product.

A person should be able to arrive without knowing anything about the internal data model and immediately understand:

- where they are in the liturgical year;
- what the Church celebrates;
- what the liturgical context is;
- what the readings are;
- how to explore another day.

---

## 63. Definition of Done

A UI task is not complete merely because the application compiles.

Consider it complete when:

- the requested feature works;
- existing relevant functionality still works;
- the layout is responsive;
- mobile interaction is comfortable;
- desktop layout is balanced;
- loading and error states are acceptable;
- accessibility basics are respected;
- data remain faithful to the source;
- visual hierarchy is clear;
- there are no obvious console errors;
- the implementation fits the design system;
- relevant routes have been tested;
- visual inspection has been performed when browser tooling is available;
- the final build passes.

---

## 64. Final Design Test

Before considering the interface finished, ask:

### Information

Can a person understand today's liturgical context in seconds?

### Navigation

Can a person move between days without friction?

### Readings

Can a person comfortably find and read the readings?

### Mobile

Does the interface remain excellent on a phone?

### Visual

Does it feel serene, Catholic, contemporary, and polished?

### Integrity

Does every liturgical fact come from the CLP data?

### Engineering

Is the implementation maintainable and consistent with the application?

If any answer is no, the task is not finished.

---

## 65. Golden Principles

### Central Architectural Principle

**The calendar is the heart of Site Liturgia.**

The interface exists around the relationship:

**calendar → selected day → liturgical information → readings.**

The current month must be immediately visible.

Available months remain hidden until the user interacts with the month/year control in the calendar header.

There is no separate Home tab.

There is no search field.

The right column exists to present the day selected in the calendar.

Liturgical information appears above the readings.

Each reading is independently expandable and collapsible.

All future UI decisions must preserve this hierarchy unless the product requirements are explicitly changed.


### Rule 1

**The CLP provides the liturgical truth.**

### Rule 2

**Site Liturgia provides the experience.**

### Rule 3

**Never invent liturgical information.**

### Rule 4

**Make the current liturgical day immediately understandable through the calendar selection.**

### Rule 5

**Design the calendar-first experience mobile first.**

### Rule 6

**Use color semantically, never as the sole source of meaning.**

### Rule 7

**Prefer hierarchy and clarity over decoration.**

### Rule 8

**Validate behavior, build, and rendered appearance whenever tooling allows it.**

### Rule 9

**Do not duplicate the CLP engine in the frontend.**

### Rule 10

**Do not destroy an existing working architecture without a clear reason.**

### Rule 11

**Use shadcn/ui as accessible primitives, not as a substitute for design.**

### Rule 12

**The final interface must feel intentionally designed for Catholic liturgical use, not like a generic AI-generated dashboard.**

---

## 66. Final Principle

The purpose of this skill is not merely to make code functional.

The purpose is to make liturgical information:

- beautiful;
- understandable;
- accessible;
- navigable;
- readable;
- trustworthy.

The engineering serves the experience.

The visual design serves the information.

The information remains faithful to the CLP.

```text
CLP
 ↓
liturgical JSON
 ↓
typed data model
 ↓
normalized UI model
 ↓
Site Liturgia
 ↓
beautiful interface
 ↓
human liturgical experience
```

**The CLP provides the truth.**

**Site Liturgia provides the experience.**
