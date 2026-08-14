# Google Stitch Prompt — Khodarak (خضارك)

Everything below is extracted from the real implementation (`tailwind.config.ts`,
`app/globals.css`, `app/layout.tsx`, `components/**`). Paste **Part 1** into Stitch
first as the system/theme prompt, then paste any screen prompt from **Part 2** to
generate that screen. Every screen prompt assumes Part 1 is already in the chat —
if you start a new Stitch project, re-paste Part 1 at the top.

---

## Part 1 — Master design-system prompt (paste this first)

```
Design a fresh-produce subscription web app called "خضارك" (Khodarak) —
farm-to-door weekly/monthly vegetable and fruit boxes for the Saudi market.

LANGUAGE & DIRECTION
- The entire UI is in Arabic. Direction is RTL (right-to-left) on every screen.
- Font family: IBM Plex Sans Arabic, weights 400 / 500 / 600 / 700, for both
  Arabic and Latin text.
- Numbers (prices, dates, IDs, quantities) use Western/lining digits
  (0123456789), tabular-aligned in tables and price columns — never Arabic-Indic
  digits in data. Marketing copy may use Arabic-Indic digits (١٢٠ ر.س).
- Currency is Saudi Riyal, written "ر.س" after the number: "120 ر.س".
- Light theme only. Do not produce a dark mode.

DESIGN DIRECTION — "Fresh & Organic", vibrant tuning
Warm cream ground, bright leaf-green primary, hot-tomato secondary, mango accent.
Alive and appetizing, still editorial and grocery-premium — the colours are
saturated but the layout stays generous: whitespace, hairline borders, soft
green-tinted shadows, large 20px rounded corners. Brand gradient bands and a
soft glow are allowed on the hero and the closing CTA and nowhere else. NOT a
neon SaaS look, NOT glassy purple, NOT heavy drop shadows, NOT gray-on-gray
dashboards, NOT gradients on every surface.

EXACT COLOR TOKENS (use these hex values literally)
Primary (bright leaf green):
  primary #11803D, on-primary #FFFFFF
  primary-container #CDF2DB, on-primary-container #0A421F
  surface-tint #11803D, success #0E7A3B, muted green #6FD79A
Secondary (ripe tomato — used for the single strongest CTA):
  secondary #C93C10, on-secondary #FFFFFF
  secondary-container #FFE0D2, on-secondary-container #7E2A0A
Accent (mango — NEW ramp, for chips, highlights and one headline word):
  accent #FFB020, on-accent #3D2600
  accent-container #FFF4D6, on-accent-container #6B3F00
Decorative-only tones (gradient stops, glows, blurred blobs — NEVER behind text):
  primary-bright #19A652, secondary-bright #F5602F, accent-bright #FFC94D
Tertiary (warm grey-green):
  tertiary #5A6157, tertiary-container #EFEBDE, on-tertiary-container #3A3F37
Surfaces (warm cream ramp):
  background (page) #FDFBF5
  surface (cards) #FFFFFF
  surface-variant #F7F4EC, surface-dim #F2ECDD, surface-container-highest #EAE2CE
  on-surface / on-background (text) #1A1D1A
  on-surface-variant (secondary text) #5A6157
  inverse-surface #14301F (deep green — footer + admin rail), inverse-on-surface #EAF5EE, inverse-primary #6FE0A0
Lines:
  outline #767D72, outline-variant (hairline borders) #E6E1D2
Status (pill backgrounds are the -container tint, text is the -on- value):
  error #CC2E1E / #FFE1DC / #8C231A
  success #0E7A3B / #CDF2DB / #0A421F
  warning #9A6300 / #FFF4D6 / #6B3F00
  info #1F6FB2 / #DCEBF7 / #173F63

COLOR RULES THAT ARE NOT NEGOTIABLE
- accent, accent-bright, primary-bright and secondary-bright are FILL ONLY.
  accent #FFB020 against white is 1.83:1 — it fails even the 3:1 non-text bar.
  Never use them as a text colour, an icon colour or a border on a light
  surface, and never put text on top of one. When you need a text-safe amber,
  use on-accent-container #6B3F00 (8.99:1 on white).
  The single exception in the app is one 36px+ bold headline word in
  accent-bright over the green hero band — 3.28:1, which is large-text AA only.
- Never de-emphasize text on a coloured band with opacity. White at 85% over
  #11803D is 4.09:1 and fails. Use solid on-primary and vary size or weight.
- text-primary and text-secondary must not sit on surface-container-high
  (#F2ECDD) or -highest (#EAE2CE) — 4.26:1. Use on-primary-container /
  on-secondary-container there instead.

TYPE SCALE (px, exact)
  display 44 / line-height 1.15 / -0.02em / 700   (46 on desktop hero, 36 mobile)
  h1 30 / 1.25 / -0.015em / 700
  h2 24 / 1.3 / -0.01em / 600
  h3 19 / 1.4 / 600
  body-lg 18 / 1.65 / 400
  body 16 / 1.7 / 400        <- default body size; 1.7 line-height, Arabic needs it
  small 14 / 1.6 / 400
  label 14 / 1.4 / 600
  caption 12.5 / 1.5 / 500
  overline 11.5 / 1.4 / +0.08em / 600, UPPERCASE, colored primary #11803D
Section headers always follow this pattern, stacked and left-aligned to the RTL
start edge: a small uppercase overline in green, then an h1 title, then an
optional 16px body-color #5A6157 subtitle.

SPACING & LAYOUT
  Scale: 4, 8, 16, 24 (gutter), 32, 48, 64, 96 px.
  Page container max-width 1280px, centered; narrow forms/auth 720px.
  Horizontal page padding: 20px mobile, 64px desktop.
  Section vertical padding: 64px, 96px for hero.
  Grid gaps: 16px for cards, 24px gutter for layout columns.

SHAPE
  Radii: 8 sm, 12 md, 16 lg, 24 xl, 9999 pill.
  THE SIGNATURE SHAPE IS 20px ("organic") — every card, every large button,
  every image panel uses 20px radius. Use it consistently.

ELEVATION (green-tinted, never neutral grey, never harsh)
  sm  0 1px 3px rgba(20,48,31,.07), 0 1px 2px rgba(20,48,31,.05)
  md  0 4px 14px rgba(17,128,61,.10), 0 1px 3px rgba(20,48,31,.06)
  lg  0 14px 32px rgba(17,128,61,.13), 0 4px 10px rgba(20,48,31,.05)
  xl  0 28px 56px rgba(17,128,61,.16), 0 10px 20px rgba(20,48,31,.05)
  focus ring 0 0 0 3px rgba(17,128,61,.22), plus a 2px #11803D outline offset 2px
GLOW (saturated, hover only, brand surfaces and the primary CTA only — a glow
under a plain white card just reads as a colour cast)
  glow-primary   0 8px 28px -6px rgba(17,128,61,.45)
  glow-secondary 0 8px 28px -6px rgba(245,96,47,.45)
  glow-accent    0 8px 28px -6px rgba(255,176,32,.50)
Most cards are FLAT: white #FFFFFF on the cream page with a 1px #E6E1D2
hairline border and no shadow. Reserve shadows for product cards (sm, lifting to
lg on hover) and the featured pricing plan (lg).

COMPONENTS (build these exactly)
- Top nav: sticky, 64px tall, full width, 1px bottom border #E6E1D2, frosted
  white background (blur 12px, rgba(255,255,255,.82)). RTL order: logo on the
  right; center links "الرئيسية / المنتجات / الاشتراكات / حاسبة الأسعار" in
  14px medium #5A6157 turning #11803D on hover; on the left a cart button with
  an item-count badge, plus a circular icon button (green, hover fill
  #CDF2DB) for account/dashboard. On mobile the links collapse into a hamburger.
- Buttons — three sizes: sm 32px tall / 12px padding / 12.5px text / radius 12;
  md 40px / 20px / 14px semibold / radius 16; lg 52px / 28px / 16px semibold /
  radius 20. Variants: primary = solid #11803D with white text (hover becomes
  #CDF2DB background with #0A421F text); secondary = solid tomato #C93C10 white
  text; outline = 1px #11803D border, transparent, green text; ghost = no border,
  #5A6157 text, hover background #F7F4EC; danger = solid #CC2E1E.
  Buttons never scale or pop on hover — only background, text and shadow change,
  150ms, cubic-bezier(.22,1,.36,1).
- Cards: radius 20, white, 1px #E6E1D2 border, 24px padding (16 compact,
  32 roomy). Card header = 19px title + optional 14px #5A6157 description on the
  left of the header row, optional action on the right.
- Badges / status pills: fully rounded, 10px horizontal / 4px vertical padding,
  12.5px semibold, container-tinted background with matching dark text, and a
  6px filled dot before the label for order/subscription statuses.
- Inputs / selects / textareas: full width, white, 1px #E6E1D2 border, radius 12,
  14px horizontal / 10px vertical padding, 16px text, placeholder #5A6157 at 60%
  opacity. Hover darkens the border to #767D72; focus turns it #11803D and adds
  the green focus ring. Errors use a #CC2E1E border and a 12.5px red message
  below. Labels are 14px semibold above the field; hints are 12.5px #5A6157.
  Required fields get a red asterisk after the label.
- Product card: radius 20, white, soft shadow, no border. A full-bleed square
  photo at the top that zooms slightly on hover (scale 1.05, 300ms), then 16px
  padding: product name at 19px semibold (turns green on hover), and a bottom row
  with the price at 19px in #11803D plus a "/ كجم" unit caption on one side and a
  quantity stepper (− count +, rounded, green outline) on the other. Out-of-stock
  items show a solid red "غير متوفر" pill in the top corner of the photo.
- Tables (admin): white surface, hairline row separators #E6E1D2, 11.5px
  uppercase #5A6157 column headers, 14px rows, numbers tabular-aligned, status
  pills in-line, row hover #FDFBF5.
- Empty states: centered outline icon in a #CDF2DB circle, 19px title, 14px
  #5A6157 explanation, one primary button.
- Icons: Lucide, stroked, 16–20px, matching the surrounding text color.
  Produce-related choices: Leaf, Sprout, Salad, Truck, ShieldCheck,
  CalendarCheck, PackageCheck, ShoppingCart.
- Footer: cream #FDFBF5 top band, 1px top border, 4 columns on desktop / 2 on
  mobile — brand block ("خضارك" 24px bold green + one-line description) plus link
  columns "المتجر" and "حسابك" under 11.5px uppercase headings, then a hairline
  and a 12.5px copyright line.

IMAGERY
Real, bright, top-down photography of fresh vegetables and fruit on light warm
backgrounds and in kraft/produce boxes. No illustrations, no 3D renders, no
stock-photo people in suits.

MOTION
Smooth and confident, never bouncy. Durations 150ms (hover colour), 200ms
(default), 300ms (image zoom, card lift), 420–520ms (entrances). Easings
cubic-bezier(.22,1,.36,1) and cubic-bezier(.16,1,.3,1). Cross-fade between pages.

  Entrances    fade-up (sections, cards), fade-in, scale-in (dialogs, empty-state
               icons), slide-in-start / slide-in-end (RTL-aware inline-axis pair,
               used for wizard steps and the mirrored category tiles)
  Feedback     pop (cart badge and quantity counters, replayed by remounting the
               node), active:scale-.98 press dip on buttons, pulse-ring on the
               current wizard step and in-flight status dots
  Ambient      gradient-pan on the hero and closing CTA bands, float on the
               blurred decorative blobs, marquee on the mobile trust strip,
               shimmer on loading skeletons
  Hover        cards lift -4px and deepen their shadow; product and category
               photos scale to 1.04–1.05; nav links grow a centre-out underline

  Rules:
  - Animate opacity and transform only. Never height, margin or layout — the
    performance budget allows CLS ≤ 0.1.
  - Inline-axis movement goes through the --start-x / --end-x sign variables.
    A raw translateX slides the wrong way under dir="rtl", which is every page.
  - Rotation and scale are direction-neutral and need no RTL handling.
  - Every entrance carries animation-fill-mode: both, so the reduced-motion
    duration override lands it on its final frame instead of hiding it.
  - Scroll reveals must degrade to visible with JS off, without an
    IntersectionObserver, and under prefers-reduced-motion.
  - Admin gets colour and a plain fade only — no reveals, no stagger, no ambient
    loops. It is a tool, not a landing page.

ACCESSIBILITY
All text meets 4.5:1 (large text 3:1); UI borders meet 3:1. Every interactive
element has the green focus ring. Icon-only buttons carry Arabic labels.
prefers-reduced-motion stops every ambient loop outright and guarantees no
revealed content is ever left invisible.
```

---

## Part 2 — Screen prompts

Paste one at a time, after Part 1.

### 1. Home / landing (`/`)

```
Design the Arabic RTL home page for خضارك, using the design system above.
Sections top to bottom:
1. Sticky top nav.
2. HERO on a solid deep-green #11803D band, full-bleed, 96px vertical padding,
   two columns: on the RTL start side a small pill badge "أهلاً بك في خضارك"
   with a leaf icon on translucent white, then a 46px bold white headline
   "طازج من المزرعة إلى باب بيتك", a 18px white-85% paragraph
   "اشترك في صندوق خضروات وفواكه طازجة، أسبوعياً أو شهرياً. أنت تختار المحتويات
   والموعد، ونحن نتكفّل بالباقي.", then two 52px buttons side by side — solid
   tomato "ابدأ اشتراكك الآن" with a left-pointing arrow, and a white-outline
   ghost "تصفّح المنتجات" — and finally a row of three icon+text proof points:
   "توصيل مجاني فوق ١٥٠ ر.س", "جودة مضمونة", "تُقطف كل صباح". On the other side a
   4:3 produce photo in a 20px-radius panel with a large soft shadow.
3. TRUST STRIP: a thin cream band with 3–4 small icon + label reassurances.
4. CATEGORY SHOWCASE: rounded category tiles (خضروات، فواكه، أعشاب، سلطات) with
   photos and a green label overlay.
5. FEATURED PRODUCTS: overline "منتجات مختارة", h1 title, then a 4-across
   product-card grid (2 on mobile) using the product card spec.
6. HOW IT WORKS: overline "كيف يعمل", h1 "ثلاث خطوات فقط", then 3 flat white
   bordered cards; each has a 44px rounded-12 #CDF2DB tile holding a green icon,
   a tabular step number "01/02/03" in overline style, a 19px title and a 14px
   description. Steps: "اختر محتويات صندوقك" / "حدّد التكرار والموعد" /
   "استلم عند بابك".
7. WHY KHODARAK: 4 benefit cards in a 2×2 or 4-across grid.
8. PLANS on a #FDFBF5 band with hairline borders top and bottom: overline
   "الخطط", h1 "اختر ما يناسب مطبخك", subtitle, then 3 plan cards — أسبوعي
   (featured: green border + large shadow + brand badge "الأكثر شيوعاً"),
   نصف شهري, شهري. Each card: 19px name, 14px tagline, 30px green price
   ("من ١٢٠ ر.س") with a 12.5px "لكل صندوق" caption, a checklist of three
   features with small green check icons, and a 44px CTA "ابدأ بهذه الخطة" —
   solid green on the featured card, outlined on the others.
9. TESTIMONIALS: 3 quote cards with a name, city and small avatar.
10. FAQ: accordion list, hairline separators, chevron on the RTL end side.
11. FINAL CTA: full-width green band, centered headline, one tomato button.
12. Footer.
```

### 2. Catalog / browse (`/browse`)

```
Design the Arabic RTL product catalog page. Sticky top nav; page title block with
overline + h1 "كل المنتجات"; a horizontally scrolling row of category tabs
(pill-shaped, active tab solid green with white text, inactive #F7F4EC with
#5A6157 text); a sort dropdown and a result count on the opposite side of the
same row. Two-column body: a 240px filter sidebar on the RTL start side
(category checkboxes, price range, availability toggle, "مسح الفلاتر" ghost
button, all inside one flat white 20px-radius bordered card) and a 3-across
product grid beside it (2 on tablet, 2 on mobile) with 16px gaps. Below the grid,
centered pagination with rounded square page buttons, active page solid green.
Include the empty-state variant: centered basket icon in a #CDF2DB circle, title
"لا توجد منتجات مطابقة", 14px explanation, and a green "مسح الفلاتر" button.
```

### 3. Product detail (`/browse/[id]`)

```
Design the Arabic RTL product detail page. Breadcrumb in 12.5px #5A6157. Two
columns: a gallery on one side — one large 20px-radius square photo with a soft
shadow plus a row of 4 small rounded thumbnails, active thumbnail outlined green
— and the info column on the other: 30px bold product name, a status badge
(green "متوفر" / red "غير متوفر"), the price at 30px in #11803D with a "/ كجم"
caption, a 16px description with 1.7 line-height, a small spec list (المصدر،
الوحدة، الحد الأدنى للطلب) as label/value rows separated by hairlines, then a
quantity stepper and a 52px solid-green "أضف إلى الصندوق" button, and three small
icon reassurance lines. Below, a "منتجات مشابهة" section with a 4-across product
card grid.
```

### 4. Subscription builder wizard (`/subscription`)

```
Design the Arabic RTL multi-step subscription builder. Top: a progress header
with 4 numbered steps connected by a hairline track — completed steps are solid
green circles with a check, the current step is a green circle with its number,
upcoming steps are #E6E1D2 circles with #5A6157 numbers; Arabic labels beneath:
"المحتويات" / "التكرار والموعد" / "العنوان" / "المراجعة والدفع".
Two-column layout: the main step panel on the RTL start side and a sticky order
summary sidebar (360px, flat white 20px-radius bordered card) on the other,
listing the box items with thumbnails and quantities, a hairline, then
المجموع الفرعي / التوصيل / الخصم rows in 14px and a bold 24px green الإجمالي,
plus a 52px tomato "متابعة" button pinned at the bottom of the card.
Show step 2 in the main panel: frequency selector as three large selectable
radio cards (أسبوعي / نصف شهري / شهري) — the selected one has a 2px green border,
a #CDF2DB tint and a green check in the corner; a delivery-day date picker as a
horizontal row of rounded date chips; and a time-slot picker as a 2-across grid
of selectable slot cards. On mobile the summary collapses into a fixed bottom bar
showing the total and the continue button.
```

### 5. Cart (`/cart`)

```
Design the Arabic RTL cart page. Title "صندوقي" plus an item count. Main column:
a flat white 20px-radius bordered card containing cart line items separated by
hairlines — each row has a 64px rounded product thumbnail, the name at 16px, the
unit price caption, a quantity stepper, the line total in tabular green, and a
ghost trash icon button. Beside it the same sticky totals card and a tomato
"إتمام الاشتراك" button. Include the empty variant: a cart icon in a #CDF2DB
circle, "صندوقك فارغ", and a green "تصفّح المنتجات" button.
```

### 6. Customer dashboard (`/dashboard`)

```
Design the Arabic RTL customer dashboard. App shell: sticky top nav plus a 240px
side navigation on the RTL start edge — flat white, hairline border, items
"نظرة عامة / اشتراكي / طلباتي / العناوين / الإعدادات" with a Lucide icon each;
the active item is a #CDF2DB pill with #0A421F text and a green start-edge bar.
Content: a page title, then a subscription status card — a large flat white
20px-radius card with a green status pill "نشط", the plan name, next delivery
date, box contents preview thumbnails, and a row of actions
(تعديل / إيقاف مؤقت / إلغاء) as outline and ghost buttons. Beside it a small
health badge card. Below, a "الطلبات القادمة" table with tabular dates, order
IDs, totals and status pills, and an amber "pending change" banner variant:
rounded-16 #FFF4D6 background, #6B3F00 text, an info icon, and a ghost undo link.
```

### 7. Auth (`/login`, `/signup`)

```
Design the Arabic RTL login and signup screens. Centered single column, max
width 720px, on the cream #FDFBF5 page. A flat white 20px-radius bordered card
with 32px padding: the خضارك logo on top, a 30px title "تسجيل الدخول", a 14px
#5A6157 subtitle, stacked labelled inputs (البريد الإلكتروني، كلمة المرور) using
the input spec, a "نسيت كلمة المرور؟" green text link on the end edge, a
full-width 52px solid-green submit button, and a hairline "أو" divider with a
switch link "ليس لديك حساب؟ أنشئ حساباً". Show the error state: a red-bordered
input with a 12.5px red message, plus a form-level alert in a rounded-16 #FFE1DC
panel with #8C231A text.
```

### 8. Admin (`/admin`)

```
Design the Arabic RTL admin panel. Denser than the customer app but the same
tokens. Side nav on the RTL start edge with sections (لوحة القيادة، الطلبات،
الاشتراكات، المنتجات، المدفوعات، المدن، فترات التوصيل، الإعدادات). Content: a
row of 4 KPI counter cards — flat white, 20px radius, an 11.5px uppercase
overline label, a 30px tabular value, and a small green/red delta caption. Below,
a filter bar (search input, two selects, date range, ghost "إعادة تعيين") inside
one bordered card, then a data table: uppercase 11.5px headers, 14px rows,
hairline separators, row hover #FDFBF5, status pills, tabular numbers, and a
trailing actions column with ghost icon buttons. Include a right-aligned pagination
footer and one modal dialog: 20px radius, 32px padding, large soft shadow, a
title, a 16px body, and ghost "إلغاء" + solid-red "تأكيد الإلغاء" buttons.
```

---

## Notes when moving Stitch output back into the codebase

- Stitch emits raw HTML/CSS or generic Tailwind. Map it back to the existing
  tokens rather than pasting hex values: `bg-surface`, `text-on-surface-variant`,
  `rounded-organic`, `text-h1`, `p-6`, `gap-stack-md`, `shadow-md`.
- Reuse `components/ui/*` (`Button`, `Card`, `Badge`, `Input`, `Container`)
  instead of re-implementing what Stitch generated.
- Never add `flex-row-reverse` — `<html dir="rtl">` already lays flex rows out
  right-to-left. Use logical properties (`ms-`, `me-`, `start-`, `end-`).
- Drop any dark-mode output; the app is light-only by decision.
