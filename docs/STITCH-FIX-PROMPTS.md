# Stitch fix prompts — CarBid

**Project:** `projects/16486941298907743014`
**Design system:** `assets/4b9e172371934d04b60e529cf158dae5` (currently named "Velocity Auction")
**Date:** 2026-08-04

## Why this file exists

The three design defects in `REQUIREMENTS.md` §11 were attempted programmatically through the
Stitch MCP API. **The API cannot persist design changes.** `edit_screens` and
`generate_screen_from_text` both run the generation, return the finished artifacts, and report
success — but nothing is committed to the project. Verified: HTML byte-identical after two
successful edits and ~3 minutes of polling; screen count unchanged after a successful
generation; no commit/save/apply-session tool exists among the 15 the server exposes.

The generation itself works fine. So the prompts below are written to be **pasted into the
Stitch UI chat**, where the first-party client persists the result.

Run them in order. Each is self-contained and names the screen it applies to.

## Decisions these prompts encode

| Decision | Chosen |
|----------|--------|
| Brand name | **CarBid** (third-party leasing provider names preserved) |
| Palette | **Blue `#135bec` dark system** — restyles login + 5 leasing screens |
| Currency | **Plain dollars with K/M abbreviations** |
| Sell wizard | **4 steps**, with a new step 3 "Condition & Documentation" |

Shared palette string used below:

> primary/accent `#135bec`, page background `#101622`, card and input surfaces `#192233`,
> primary text `#f6f6f8`, muted text `#92a4c9`, borders `#324467`, Manrope font

---

## Fix 3 — Brand and palette (6 screens)

### 3a · Car Auction Login (`53b74847965340938198cee6737a8f55`)

```text
Rebrand and restyle this login screen.
1) Replace the brand wordmark "AUTO BID" with "CarBid". If the wordmark is split into two
coloured parts, render "Car" in the primary text colour and "Bid" in the accent colour. Keep
the tagline "Premium Auctions" unchanged.
2) Replace the orange and warm-brown colour scheme entirely. Use primary/accent #135bec, page
background #101622, card and input surfaces #192233, primary text #f6f6f8, muted text #92a4c9,
borders #324467. Keep the Manrope font. Remove every trace of the orange #f47b25 and the warm
brown #221710 background.
3) Keep all existing controls exactly: email field, password field with its visibility toggle,
the "Forgot?" link, the Sign In button, the "Or continue with" divider, the Google and Apple
buttons, and the "Don't have an account? Create Account" footer.
Preserve every other existing element, value, label, icon and layout exactly as-is. Do not add,
remove, reorder or restyle anything not listed above.
```

### 3b · Auction Listings Grid (`5713e9ea4aa64845900e20cc8cac5162`)

```text
Replace the brand name "LUXE AUCTIONS" in the header with "CarBid". Keep the car icon beside
it. Preserve every other existing element, value, label, icon and layout exactly as-is.
```

### 3c · Leasing Options Directory, Lease Application Form, Lease Summary & Bid Update

Screen IDs: `062965668d9b43d79f710c4350fc2a4c`, `7ea180c7387f4c5f8e0445b494879e19`,
`dbfffc72d8b7447d85a98e46c7f67ba8` — select all three, then:

```text
Rebrand and restyle these leasing screens to match the rest of the app.
1) The platform brand is now "CarBid". Change the header logo/wordmark from "Velocity Auction"
to "CarBid", and set any logo image alt text to "CarBid Logo". IMPORTANT: do NOT rename the
third-party leasing providers — "Velocity Prime Capital", "Summit Global Leasing" and "Elite
Asset Credit" are external vendors and must keep their names exactly.
2) Replace the periwinkle/Material colour scheme. Use primary/accent #135bec, page background
#101622, card surfaces #192233, primary text #f6f6f8, muted text #92a4c9, borders #324467. Keep
the Manrope font. Remove the periwinkle #b4c5ff, the #11131b background, the #e1e1ee body text
and the peach #ffb59b accent.
Preserve every other existing element, value, label, icon and layout exactly as-is. Do not add,
remove, reorder or restyle anything not listed above.
```

### 3d · Assigned Leasing Agent (`44cf34f03f81449bb3978fe0a6a8fc34`)

Same as 3c, plus:

```text
3) Change the reference ID prefix from "VEL-" to "CB-", so it reads "Reference ID: CB-2049-LX".
```

### 3e · Agent: Document Upload (`00e260c11ff3408583bf3608e9d0e13b`)

Same as 3c, plus:

```text
3) Rename the "Velocity Verification" feature card heading to "CarBid Verification". Keep its
body copy about AI VIN extraction and the under-2-hour review unchanged. Keep the "Dealer Terms"
link text as-is.
```

### 3f · Design system rename (do this in the UI, not by prompt)

Rename the design system from **"Velocity Auction"** to **"CarBid"**.

Do this through the Stitch interface directly. The `update_design_system` API call requires the
full `DesignSystem` object and `styleGuidelines` is not a writable field on it — calling it
risks discarding the detailed style guidelines text already stored there.

Also worth fixing while you are in there: the **project-level theme is stale**. It still reads
`colorMode: LIGHT, customColor: #f47b25`, while the design system correctly reads
`colorMode: DARK, customColor: #135bec`. All 18 screens are dark. Align the project theme to the
design system.

---

## Fix 2 — Currency scale (2 screens)

### 2a · Filter and Sort Options (`e7c17a07890b4de4834f737160021050`)

```text
Fix the price filter's units so they match the app's real inventory, which ranges from about
$450K to $2.5M per vehicle.
1) Change the section heading "Price Range (Millions)" to just "Price Range".
2) Change the slider's minimum label from "0M" to "$0" and its maximum label from "500M+" to
"$5M+".
3) Change the active selected-range readout from "12M - 450M" to "$450K - $2.5M", and move the
two slider handles so their positions correctly reflect $450K and $2.5M on the new $0 to $5M+
scale (both handles sit in the lower half of the track).
4) Format every price as a plain dollar amount with a leading "$" and K/M abbreviations. The
word "Millions" must not appear anywhere on the screen.
5) Keep the Sort By, Brand, Year and Body Style sections, the Reset button and the "Show 1,248
Results" button exactly as they are.
Preserve every other existing element, value, label, icon and layout exactly as-is.
```

The second half of this fix is folded into 1a below, because the reserve-price field lives on
the sell wizard's first step.

---

## Fix 1 — Sell wizard (3 edits + 1 new screen)

### 1a · Sell Your Car Form (`8c4463f54f02424d9a560bc1f8ffbccd`)

Fixes the step count, the reserve-price currency, and the four fields the review screen
displays but never captures.

```text
Update this "List Your Vehicle" wizard screen.
1) Change the step label from "Step 1 of 3" to "Step 1 of 4".
2) Fix the Reserve Price field's units: delete the "Millions" suffix label entirely, keep the
"$" prefix, and set the placeholder to "85,000". Keep its existing helper text about the minimum
acceptable price. It must read as a plain dollar amount.
3) Add a "Body Style" dropdown immediately after the existing Category dropdown, with options:
Sedan, Coupe, SUV, Convertible, Hatchback, Wagon, Truck.
4) Add a "Location" text field with a location-pin icon and the placeholder "e.g. Los Angeles, CA".
5) Add a new "Auction Setup" section directly below the Reserve Price field, containing two
fields: "Starting Bid" — a required dollar amount with a "$" prefix, placeholder "85,000", and
helper text "The opening bid for your auction."; and "Auction Duration" — a dropdown with
options: 3 days, 5 days, 7 days, 10 days, 14 days.
6) Keep the photo upload area, the Car Model, Year, Mileage and Category fields, the "Drafts"
affordance, the close button, and the bottom "Next: Description & Details" button exactly as
they are.
Preserve every other existing element, value, label, icon and layout exactly as-is.
```

### 1b · Listing Description & Details (`13740abd4619481d90edf7efc3d75efd`)

```text
A new step 3 now sits between this screen and the review screen. Change the bottom primary
button's label from "Next: Review & Submit" to "Next: Condition & Documentation". Keep the
"Step 2 of 4" label and the "50% Complete" progress indicator exactly as they are.
Preserve every other existing element, value, label, icon and layout exactly as-is.
```

### 1c · NEW screen — Sell Your Car: Condition & Documentation

**This screen has already been generated and is saved locally**, because the API would not
commit it:

- `design/generated/sell-step3-condition-and-documentation.html` (17.7 KB)
- `design/generated/sell-step3-condition-and-documentation.png` (preview, 780×2536)

To recreate it inside Stitch, paste this prompt as a **new screen** generation and pin it to
the `CarBid` design system:

```text
Create the third step of a four-step "Sell Your Car" wizard for CarBid, a dark-theme mobile app
that auctions luxury and performance cars worth $450K to $2.5M. This screen captures condition
evidence and paperwork, which buyers rely on before bidding.

Screen title: "Sell Your Car" in the header, with a back chevron on the left and a "Help" text
button on the right.
Below the header: a step indicator reading "Step 3 of 4" with a progress bar at "75% Complete".
Section heading: "Condition & documentation" with the subtitle "High-value buyers expect
evidence. Complete records attract stronger bids."

Content, in order:
1) A "Condition Report" upload card with a picture-as-pdf icon, the label "Condition Report
(PDF)", helper text "A professional inspection report. Strongly recommended.", and an upload
drop zone. Show one uploaded file in a success state: "inspection_porsche_911.pdf" with a green
check and the caption "Uploaded".
2) A "Service Records" multi-file upload card with a receipt-long icon, helper text "Invoices
and maintenance history. PDF, JPG or PNG.", showing a badge reading "4 documents" and a small
horizontal row of 4 thumbnail chips each with a delete affordance.
3) A "VIN" text input with a barcode/tag icon, placeholder "WP0AA2A96NS220156", a 17-character
monospace-feeling field, and helper text "We verify the VIN against national records before your
listing goes live."
4) A "Known Flaws & Damage" textarea with the placeholder "Disclose any stone chips, kerbed
wheels, paintwork or mechanical faults. Full disclosure protects you from post-sale disputes."
5) A "Modifications" toggle row labelled "Vehicle has aftermarket modifications" with the
sub-label "Non-factory parts, tuning or cosmetic changes".
6) An informational callout with an info icon and a shield/verified feel reading: "Listings with
a condition report and full service history receive 40% more bids on average."

Bottom bar: a secondary "Back" button and a primary "Next: Review & Submit" button side by side.

Visual system — match exactly: dark mode, primary/accent #135bec, page background #101622, card
surfaces #192233, primary text #f6f6f8, muted text #92a4c9, borders #324467, Manrope font, 8px
corner radius, 16px horizontal margins, 390px mobile viewport. Upload cards are bordered dashed
drop zones on the card surface. Match the crisp, information-dense, corporate-modern styling of
a premium auction app.
```

### 1d · Review and Submit Listing (`8ac26e2b2f5d40fe9fa3872bd436bcb0`)

```text
Add one new review section to this "Review & Submit" screen, matching the existing
review-section pattern exactly (leading icon + heading + an "Edit" button on the right + a grid
of label/value rows).
Insert it after the "Technical Specs" section and before the "Description" section.
Heading: "Condition & Documentation" with a fact-check or verified-user icon.
Rows: "Condition Report" -> "Uploaded (PDF)"; "Service Records" -> "4 documents"; "VIN" ->
"WP0AA2A96NS220156"; "Known Flaws" -> "Minor stone chips, front bumper".
Keep the "Step 4 of 4" label, the vehicle summary card, the Vehicle Info section, the Technical
Specs section, the Description section, the certification checkbox and both bottom buttons
exactly as they are.
Preserve every other existing element, value, label, icon and layout exactly as-is.
```

---

## Verification checklist

After running the prompts, confirm:

- [ ] No screen contains "AUTO BID", "LUXE AUCTIONS", or "Velocity Auction" *as the platform brand*
- [ ] "Velocity Prime Capital", "Summit Global Leasing", "Elite Asset Credit" are **unchanged**
- [ ] No screen contains `#f47b25` or `#b4c5ff`
- [ ] The word "Millions" appears nowhere in the app
- [ ] Sell wizard reads 1 of 4 → 2 of 4 → 3 of 4 → 4 of 4, with 25/50/75/100% progress
- [ ] Body Style, Location, Starting Bid and Auction Duration are all captured in step 1
- [ ] Step 2's next button reads "Next: Condition & Documentation"
- [ ] Review screen has a Condition & Documentation section
- [ ] Design system renamed to "CarBid"; project theme set to DARK / `#135bec`

## Still outstanding after these fixes

These §11 items are untouched by this pass and still need decisions:

- **11.3** Five different bottom tab bars (recommendation in `REQUIREMENTS.md` FR-NAV-01)
- **11.4** Space Grotesk on Auction Won Celebration vs Manrope everywhere else
- **11.7** Mock prices contradict across screens (Ferrari SF90 at $2.5M vs $542K)
- **11.8** Mileage in km on the sell form vs miles on browse and detail
- **11.9** Consumer and B2B dealer flows sharing one navigation
- **11.10** Four incompatible identifier formats
- **11.11** Proxy bidding on the lease screen only
- **11.12** Category lists diverge between browse and listing creation
- **11.13** Engine and transmission enums cannot describe the featured cars
