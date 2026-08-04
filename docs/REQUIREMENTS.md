# CarBid — Software Requirements Specification

**Version:** 0.1 (draft)
**Date:** 2026-08-04
**Status:** Derived from design; not yet reviewed by product owner
**Source of truth:** Google Stitch project `projects/16486941298907743014` ("CarBid"), 18 mobile UI screens, last updated 2026-08-03

---

## 1. About this document

### 1.1 Purpose

This specification reverse-engineers the functional and non-functional requirements of the
CarBid mobile application from the UI designs that exist today. It is intended as the input
to architecture, API design, and sprint planning.

### 1.2 Method and evidence rules

Every requirement below is tagged so its provenance is unambiguous:

| Tag | Meaning |
|-----|---------|
| **[O]** | **Observed** — directly visible in a Stitch screen (label, field, value, or state). Traceable via the screen ID. |
| **[I]** | **Inferred** — not drawn, but structurally required for an observed element to function. Safe to build, worth confirming. |
| **[?]** | **Open question** — the designs are silent or contradictory. Must be decided before implementation. |

No requirement in this document is invented product scope. Where the designs imply
behaviour they do not show, it is marked **[I]**; where they conflict, the conflict is
recorded in §11 rather than silently resolved.

### 1.3 Scope boundary

- **In scope:** the 18 designed mobile screens and the behaviour they demand.
- **Out of scope for v0.1:** admin/back-office tooling, dealer web console, and anything with no
  design representation. §12 lists the screens that must be designed before the product is
  shippable — that list is long, and it is the single most important output of this analysis.

### 1.4 Current implementation state

The repository is empty apart from `.claude/`. There is no backend, no client, and no
schema. Everything in §7 (data model) is therefore a proposal, not documentation of
existing tables.

---

## 2. Product overview

CarBid is a **mobile-first, dark-theme, timed online auction marketplace for luxury and
performance vehicles**, with an attached **vehicle financing / leasing module**.

Three capability clusters are visible in the designs:

1. **Consumer marketplace** — browse, filter, bid, win, pay, take delivery. (10 screens)
2. **Consumer selling** — a multi-step listing wizard with moderator approval. (4 screens)
3. **Financing** — lease provider comparison, lease application, agent assignment, and
   bidding limits derived from approved credit. (4 screens, plus 1 B2B dealer screen)

Observed price points range from **$450K to $2.5M** per vehicle **[O]**, which materially
raises the bar on identity verification, payment rails, and dispute handling compared with a
mass-market auction app. The designs reflect this: bank wire is the *recommended* payment
method, not card **[O]**.

### 2.1 Actors

| Actor | Evidence | Notes |
|-------|----------|-------|
| **Bidder / Buyer** | All auction screens **[O]** | Tiered ("Gold Tier Member", "Since 2021") **[O]** |
| **Seller** | Sell wizard, "8 Listed" profile stat **[O]** | Same account as bidder — one profile shows both bid and listing counts **[O]** |
| **Leasing applicant** | Lease Application Form **[O]** | May be the same person as Bidder **[I]** |
| **Leasing agent** | "Julian Vance, Senior Acquisition Specialist", "Online Now" **[O]** | Staff-side actor; **no staff-facing UI exists** |
| **Dealer / facility operator** | "Agent: Document Upload" — facility profile, DMS export, operating license, $2.5M requested credit **[O]** | A **B2B actor** reached through the consumer nav — see §11.9 |
| **Listing moderator** | "being reviewed by our team", "Pending Approval" **[O]** | Staff-side actor; **no staff-facing UI exists** |
| **Finance/ops (settlement)** | Wire transfer flow, "Documentation & Tax" line **[O]** | **[I]** |

### 2.2 Screen inventory (traceability base)

All screens are `MOBILE`, authored at 780px logical width (390pt @2x).

| # | Screen | Stitch ID | Height | Module |
|---|--------|-----------|--------|--------|
| S01 | Car Auction Login | `53b74847965340938198cee6737a8f55` | 1768 | Identity |
| S02 | Auction Listings Grid | `5713e9ea4aa64845900e20cc8cac5162` | 2588 | Discovery |
| S03 | Filter and Sort Options | `e7c17a07890b4de4834f737160021050` | 1768 | Discovery |
| S04 | Vehicle Details and Bidding | `b06fd6b1577e483f9688474217560e52` | 2602 | Bidding |
| S05 | My Bids Dashboard | `12190c2f520243efb4a38a0f1c97900b` | 1768 | Bidding |
| S06 | Auction Won Celebration | `2ba3661792b147878c86dcdccadbf334` | 1768 | Post-auction |
| S07 | Payment and Checkout | `f78d27937f774705a2f3ad867265f16e` | 2230 | Post-auction |
| S08 | Sell Your Car Form | `8c4463f54f02424d9a560bc1f8ffbccd` | 2068 | Selling (step 1) |
| S09 | Listing Description & Details | `13740abd4619481d90edf7efc3d75efd` | 2450 | Selling (step 2) |
| S10 | Review and Submit Listing | `8ac26e2b2f5d40fe9fa3872bd436bcb0` | 3060 | Selling (step 4) |
| S11 | Listing Submitted Success | `69304cb285ce4baab4e75163b881270f` | 1768 | Selling |
| S12 | Auction Notification Center | `ae2581bae88f4e728f792f5ad128684a` | 1768 | Notifications |
| S13 | User Profile and Settings | `996d7fdc73c649cc9425571b738fd597` | 1768 | Account |
| S14 | Leasing Options Directory | `062965668d9b43d79f710c4350fc2a4c` | 1988 | Financing |
| S15 | Lease Application Form | `7ea180c7387f4c5f8e0445b494879e19` | 2236 | Financing |
| S16 | Assigned Leasing Agent | `44cf34f03f81449bb3978fe0a6a8fc34` | 2344 | Financing |
| S17 | Lease Summary & Bid Update | `dbfffc72d8b7447d85a98e46c7f67ba8` | 2396 | Financing ↔ Bidding |
| S18 | Agent: Document Upload | `00e260c11ff3408583bf3608e9d0e13b` | 2004 | Dealer onboarding (B2B) |

Two further Stitch assets are images, not screens, and carry no requirements:
"Velocity Auction Logo" (`fea8858706244fc089d30a92f0f4c9c4`) and a generated profile avatar
(`bd505f06117d4f6084f11bed21e7b478`).

**Note the gap in the sell wizard: S08 is "Step 1 of 3", S09 is "Step 2 of 4", S10 is
"Step 4 of 4". Step 3 has never been designed, and the total is contradictory.** See §11.5.

---

## 3. Information architecture

### 3.1 Navigation model

A persistent 5-item bottom tab bar **[O]**, plus a modal/stack layer for wizards, sheets,
and celebration screens **[O]** (S03, S06, S08, S11 all present a close "×" rather than a
back chevron).

**The tab bar is not consistent across the designs.** Five different configurations appear:

| Screens | Tab bar as drawn |
|---------|------------------|
| S12 | Home · Browse · My Bids · Alerts · Profile |
| S13 | Home · Search · Bids · Profile *(4 items)* |
| S05 | Explore · My Bids · **Sell (FAB)** · Watchlist · Account |
| S02 | Explore · Saved · **Sell (FAB)** · Bids · Profile |
| S14–S18 | Home · Browse · My Bids · **Leasing** · Profile |

**FR-NAV-01 [?]** A single canonical tab bar must be chosen before implementation. The
options are mutually exclusive: a Leasing tab and a Sell FAB cannot both occupy the centre
slot, and "Watchlist"/"Saved" vs "Alerts" vs "Leasing" compete for the same two slots.
Recommendation: **Explore · Bids · Sell (FAB) · Leasing · Profile**, moving Alerts to a
header bell (already drawn on S02 and S05) and Saved into Profile — this is the only
arrangement that preserves every destination the designs actually link to.

**FR-NAV-02 [I]** A Home/dashboard destination is referenced by four screens' tab bars and
by S11's "Back to Home" button, but **has never been designed**. Either design it or
redirect Home to Explore.

### 3.2 Observed flows

```
Login (S01) ──> [Home: not designed] ──> Explore (S02) ──> Filter sheet (S03)
                                             │
                                             └──> Vehicle Details (S04) ──> Place Bid
                                                       │
                                    ┌──────────────────┴───────────────┐
                                    ▼                                  ▼
                              My Bids (S05)                    Auction Won (S06)
                              Winning / Outbid                        │
                                    │                                 ▼
                                    └── Quick Bid ──> S04       Checkout (S07) ──> [Delivery tracking: not designed]

Sell:  S08 (1 of 3) ──> S09 (2 of 4) ──> [step 3: MISSING] ──> S10 (4 of 4) ──> S11

Finance: S14 (compare providers) ──> S15 (apply) ──> S16 (agent assigned)
                                                          │
                                                          ▼
                                                   S17 (approved → raise bid) ──> S04

Dealer:  S18 (facility credit + document upload)  [entry point undefined]

Cross-cutting: S12 notifications deep-link into S04 / S07 / S13
```

**FR-NAV-03 [?]** S18 (dealer facility onboarding) has no designed entry point. It renders
the Leasing nav and header, implying it lives under Leasing, but its content is B2B
inventory financing, not consumer leasing.

---

## 4. Functional requirements

### 4.1 Identity and access (S01)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-AUTH-01 | Users authenticate with email address and password. | [O] |
| FR-AUTH-02 | The password field provides a show/hide visibility toggle. | [O] |
| FR-AUTH-03 | A "Forgot?" affordance initiates password recovery. Target screen **not designed**. | [O] / [?] |
| FR-AUTH-04 | Federated sign-in with **Google** and **Apple** is offered. | [O] |
| FR-AUTH-05 | A "Create Account" path exists for registration. Target screen **not designed**. | [O] / [?] |
| FR-AUTH-06 | Email must be validated for format client-side before submission (`type="email"`). | [O] |
| FR-AUTH-07 | Sessions must persist across app launches; no re-login is shown in any flow. | [I] |
| FR-AUTH-08 | Failed-login, locked-account, and network-error states must be presented inline on S01. **Not designed.** | [I] |
| FR-AUTH-09 | Given transaction values up to $2.5M, MFA/step-up authentication is required before bid placement or payment. **Not designed, and not optional at these amounts.** | [?] |
| FR-AUTH-10 | Identity verification (KYC) is a first-class account state — S13 shows "Identity Verification · Verified Status: Active" and S12 confirms "Your identification documents have been verified. Happy bidding!". | [O] |
| FR-AUTH-11 | Bidding eligibility is gated on KYC status. Strongly implied by FR-AUTH-10's "Happy bidding!" phrasing, but the gate, the blocked state, and the submission flow are all undesigned. | [I] / [?] |

### 4.2 Discovery — browse, search, filter (S02, S03)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-DISC-01 | Listings are presented as a 2-column card grid. | [O] |
| FR-DISC-02 | Each card shows: hero image, favourite toggle, title (make + model), year, mileage, current price, and an optional status badge. | [O] |
| FR-DISC-03 | Status badges observed: **"Live Now"** and **"Ends in 2h"** (urgency countdown). Only 2 of 6 cards carry a badge, implying the badge is conditional on auction state. | [O] |
| FR-DISC-04 | A free-text search field accepts make, model, or year ("Search make, model, or year..."). | [O] |
| FR-DISC-05 | Horizontally scrolling category filters: **Cars, Vans, Bikes, Trucks, Electric**. | [O] |
| FR-DISC-06 | The grid header shows a live result count — "Live Auctions (242)". | [O] |
| FR-DISC-07 | An inline sort control shows the active sort ("Sort: Newest First") and opens the sort options. | [O] |
| FR-DISC-08 | A filter icon opens the filter-and-sort sheet (S03). | [O] |
| FR-DISC-09 | Sort options: **Newest, Price: Low to High, Price: High to Low, Year: New to Old**. Single-select. | [O] |
| FR-DISC-10 | Filter: **price range**, dual-handle slider, bounds `0M` to `500M+`, shown active at `12M – 450M`. Units are labelled "Millions" — see §11.6, this contradicts every listing price in the app. | [O] / [?] |
| FR-DISC-11 | Filter: **brand**, multi-select chips with manufacturer logos and a selected check state; 3 shown plus "+12 More" — so ≥15 brands, requiring an expanded brand picker that is **not designed**. | [O] / [?] |
| FR-DISC-12 | Filter: **year range**, dual-handle slider, bounds 2000–2024, shown active at 2018–2024. | [O] |
| FR-DISC-13 | Filter: **body style**, icon chips — Sedan, SUV, Coupe. The set is visibly truncated (S09's listing form offers more body styles). | [O] |
| FR-DISC-14 | The sheet's primary action previews the outcome: **"Show 1,248 Results"** — the count must recompute live as filters change, before applying. | [O] |
| FR-DISC-15 | "Reset" clears all filters and sort back to defaults. | [O] |
| FR-DISC-16 | Favouriting from a card persists to a Watchlist/Saved collection. The collection is a tab bar destination but **is not designed**. | [O] / [?] |
| FR-DISC-17 | Grid pagination or infinite scroll is required — 242 live auctions cannot render in one page. Mechanism undesigned. | [I] |
| FR-DISC-18 | Empty-result, loading-skeleton, and search-no-match states are required. **None designed.** | [I] |

### 4.3 Auction and bidding (S04, S05, S17)

#### Vehicle detail (S04)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-BID-01 | The detail screen shows an image gallery, a **"Live Auction"** state badge, year, make/model, and a human-readable asset identifier ("Asset ID: #FER-SF90-0042"). | [O] |
| FR-BID-02 | **Current Bid** is displayed as the headline figure ($2,500,000). | [O] |
| FR-BID-03 | A **"Reserve Met"** indicator communicates whether the reserve price has been reached. | [O] |
| FR-BID-04 | A **live countdown** shows remaining time as HH:MM:SS (`02 : 14 : 35`), alongside the absolute end time ("End Sun, 4:00 PM"). The countdown must tick client-side and reconcile with server time. | [O] / [I] |
| FR-BID-05 | Key specifications are surfaced as an icon triplet: mileage ("1,200 Miles"), engine ("4.0L V8 Hybrid"), transmission ("8-Speed DCT"). | [O] |
| FR-BID-06 | A vehicle overview description is shown truncated with an expand affordance. | [O] |
| FR-BID-07 | A **Condition Report** is opened via "Read Condition Report" with an external-link icon — implying a PDF or web view. Neither the document nor its viewer is designed. | [O] / [?] |
| FR-BID-08 | A **Recent Bids** feed lists bidder pseudonym, initials avatar, relative timestamp, and amount, with a total count ("14 total"). | [O] |
| FR-BID-09 | Bidder identity is pseudonymised in public view ("John_Doe92", "A_Smyth"). Real names must never appear in the bid feed. | [O] |
| FR-BID-10 | **Quick-increment buttons** offer +$10,000 / +$25,000 / +$50,000 / +$100,000. | [O] |
| FR-BID-11 | A **"Your Next Bid"** value is computed and displayed before commitment; at current bid $2,500,000 it reads $2,510,000, i.e. the default increment is the smallest step (+$10,000). | [O] |
| FR-BID-12 | "Place Bid" commits the bid. **No confirmation dialog, success state, or rejection state is designed** — for an irrevocable financial commitment of this size, all three are mandatory. | [O] / [?] |
| FR-BID-13 | Increment tiers must scale with vehicle value: +$10,000 is a plausible minimum on a $2.5M Ferrari but absurd on the $450K BMW in S02, and the designs show only one tier set. | [?] |
| FR-BID-14 | The bid feed and current bid must update in real time while the screen is open (WebSocket or equivalent) — S12's "Outbid!" notification arriving 2 minutes after the event confirms live bid propagation. | [I] |
| FR-BID-15 | Share and favourite actions are available from the detail header. | [O] |
| FR-BID-16 | Auction-ended, auction-lost, reserve-not-met, and bid-rejected (outbid during submission) states are required. **None designed.** | [I] |
| FR-BID-17 | Anti-sniping behaviour (soft close / time extension on late bids) is undefined. This is a core auction-fairness rule and cannot be left to implementation. | [?] |
| FR-BID-18 | Proxy/maximum bidding is implied by S17's "Your Max Bid" field but absent from S04's bidding UI. The two screens disagree on whether the product has proxy bidding. | [?] |

#### My Bids (S05)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-BID-19 | Bids are segmented into **Active** and **History** tabs. | [O] |
| FR-BID-20 | Each entry shows vehicle title, **Highest Bid** and **Your Bid** side by side, a status badge, and time remaining. | [O] |
| FR-BID-21 | Status values observed: **Winning** (your bid == highest) and **Outbid** (your bid < highest). | [O] |
| FR-BID-22 | Time remaining is styled for urgency — a `schedule` icon for "Ends in 2h 45m" / "Ends in 1d 4h" versus an `alarm` icon for "Ends in 14m 22s". A threshold governs the switch. | [O] / [?] |
| FR-BID-23 | **Winning** entries offer "View Auction"; **Outbid** entries offer **"Quick Bid"** — a one-tap re-bid. Its confirmation model is undesigned and it must not place a bid without confirmation. | [O] / [?] |
| FR-BID-24 | The History tab's contents (won / lost / expired entries) are **not designed**. | [?] |
| FR-BID-25 | An empty state for "no active bids" is required. **Not designed.** | [I] |

### 4.4 Post-auction — win, pay, deliver (S06, S07)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-POST-01 | Winning triggers a celebration screen showing trophy iconography, vehicle thumbnail, title, an ID ("ID: #77291"), and the **Winning Price**. | [O] |
| FR-POST-02 | **The buyer must complete the transaction within 24 hours** — "Complete your transaction within the next 24 hours to secure your vehicle." | [O] |
| FR-POST-03 | The consequence of missing the 24-hour window (forfeit, penalty, relist, deposit loss) is **undefined** and must be specified — it is a contractual term, not a UI detail. | [?] |
| FR-POST-04 | Primary action "Proceed to Payment" routes to checkout; secondary action "Share Success". | [O] |
| FR-POST-05 | Checkout shows an **Order Summary**: lot number ("Lot #8812"), vehicle title, trim/colour ("Chalk Gray / Black Interior"), and a price breakdown. | [O] |
| FR-POST-06 | **Fee schedule (observed and arithmetically consistent):** Winning Bid $215,400.00 + **Auction Fee 5%** $10,770.00 + **Documentation & Tax** $1,850.00 = **Total $228,020.00**. | [O] |
| FR-POST-07 | The 5% auction fee is a buyer's premium computed on the winning bid. Whether it is capped, tiered, or flat across all price points is **undefined** — 5% of $2.5M is $125,000. | [O] / [?] |
| FR-POST-08 | "Documentation & Tax" is shown as a single fixed line ($1,850). Real tax varies by jurisdiction; the calculation rule is **undefined**. | [O] / [?] |
| FR-POST-09 | Payment methods: **Bank Wire Transfer** (badged RECOMMENDED, "Preferred for high-value transactions"), **Credit / Debit Card** (Visa, Mastercard, Amex), **Crypto Wallet** (BTC, ETH, USDC). Single-select. | [O] |
| FR-POST-10 | Each payment method requires its own capture/instruction sub-flow — wire instructions and reference, card entry (or saved card selection), crypto address and confirmation tracking. **None are designed.** | [I] / [?] |
| FR-POST-11 | Card payment of a $228,020 total is not viable on standard card rails. Card must either be limited to a deposit or carry an explicit ceiling. | [?] |
| FR-POST-12 | Crypto settlement introduces exchange-rate locking, confirmation depth, and refund-address requirements — all **undefined**. | [?] |
| FR-POST-13 | A shipping/delivery section shows a selected address, delivery type ("Home Delivery"), and "Fully Insured Transit", with an "Edit" affordance. The address editor is **not designed**. | [O] / [?] |
| FR-POST-14 | Trust signals are displayed at the point of payment: "Authenticated", "256-Bit SSL", "Buyer Protected", "256-bit Encrypted". These are marketing claims that the implementation must actually satisfy. | [O] |
| FR-POST-15 | "Complete Purchase" is bound to acceptance of **Terms of Service** and **Refund Policy** (linked, click-through consent, no explicit checkbox on this screen). | [O] |
| FR-POST-16 | Payment-processing, payment-success, payment-failure, and post-purchase order-tracking screens are **not designed**. S12 references "Payment successful for 2019 Audi R8. Check your email for shipping details." — so at minimum an order/shipping record exists server-side. | [O] / [?] |

### 4.5 Selling — listing creation (S08, S09, S10, S11)

**Wizard step 1 — Basic Information (S08, labelled "Step 1 of 3")**

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-SELL-01 | Photo upload with guidance ("Upload high-quality photos from various angles to increase bid rates") via a "Select Images" action. | [O] |
| FR-SELL-02 | Minimum/maximum photo count, accepted formats, size limits, ordering, and hero-image selection are all **undefined**. | [?] |
| FR-SELL-03 | Field: **Car Model** — free text, placeholder "e.g. Porsche 911 Carrera". A single free-text field for make+model conflicts with S03's structured brand filter; listings must be attributable to a canonical make. | [O] / [?] |
| FR-SELL-04 | Field: **Year** — numeric, `YYYY`. | [O] |
| FR-SELL-05 | Field: **Mileage** — numeric with unit suffix **km**. Note S02 and S04 display mileage in **miles**. | [O] / [?] |
| FR-SELL-06 | Field: **Category** — select: Cars, Vans, Bikes, Trucks. Note S02's browse categories add **Electric**, so the two lists diverge. | [O] / [?] |
| FR-SELL-07 | Field: **Reserve Price** — optional, `$`, suffixed "Millions", with the rule stated in-product: "The minimum price you're willing to accept. The car won't sell if the highest bid is below this." | [O] |
| FR-SELL-08 | A **Drafts** affordance implies listings persist before submission. Draft list/resume UI is **not designed**. | [O] / [?] |
| FR-SELL-09 | No **starting bid** or **auction duration** field appears anywhere in the wizard, yet S10's review screen displays "Starting Bid $85,000" and every auction has an end time. Both inputs are missing from the flow. | [?] |

**Wizard step 2 — Description & Details (S09, labelled "Step 2 of 4", "50% Complete")**

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-SELL-10 | Field: **Detailed Description** — long-form textarea with prompt guidance (modifications, recent services, unique features). | [O] |
| FR-SELL-11 | Technical specs — **Engine Type** select: 2.0L Turbo I4, 3.0L V6, Electric, Hybrid. | [O] |
| FR-SELL-12 | Technical specs — **Transmission** select: Automatic, Manual, Dual-Clutch. | [O] |
| FR-SELL-13 | Technical specs — **Fuel Type** select: Gasoline, Diesel, Electric, Other. | [O] |
| FR-SELL-14 | Technical specs — **Drive Type** select: AWD, RWD, FWD. | [O] |
| FR-SELL-15 | Technical specs — **Exterior Color** and **Interior Color**, free text. | [O] |
| FR-SELL-16 | The enumerations in FR-SELL-11..14 are demonstrably too narrow for the inventory on display: no listed engine option describes the Ferrari SF90's "4.0L V8 Hybrid" (S04) or the Porsche's "3.0L Twin-Turbo H6" (S10), and "8-Speed PDK"/"8-Speed DCT" are absent from Transmission. These lists must be expanded or made free-text. | [O] / [?] |
| FR-SELL-17 | Vehicle history — **Number of previous owners**, segmented control: 1, 2, 3, 4+. | [O] |
| FR-SELL-18 | Vehicle history — **Full Service History** toggle ("Regular maintenance records available"). | [O] |
| FR-SELL-19 | Vehicle history — **Accident History** toggle ("Has this vehicle ever been in a collision?"). | [O] |
| FR-SELL-20 | A progress indicator shows step position and percentage complete. | [O] |
| FR-SELL-21 | Back / Next navigation preserves entered data in both directions. | [O] / [I] |
| FR-SELL-22 | Step 2's "Next" is labelled **"Next: Review & Submit"**, skipping straight to step 4 — which is why step 3 is missing. Given S04 requires a condition report and S08 only offers basic photo upload, step 3 was most likely **documents/condition/history evidence**. It must be designed or formally removed. | [O] / [?] |

**Wizard step 4 — Review & Submit (S10, labelled "Step 4 of 4")**

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-SELL-23 | A summary card shows hero image, title, location ("Los Angeles, CA"), and **Starting Bid**. Location is never captured as an input anywhere in the wizard. | [O] / [?] |
| FR-SELL-24 | Review sections — **Vehicle Info** (Mileage, Body Style, Exterior Color, Interior Color), **Technical Specs** (Engine, Transmission, Drivetrain, Fuel Type), **Description** — each with a section-level "Edit" that deep-links back to the relevant step. | [O] |
| FR-SELL-25 | **Body Style** ("Coupe") appears in review but is never captured as an input in S08 or S09. | [O] / [?] |
| FR-SELL-26 | Submission requires an explicit certification checkbox: "I certify that all information provided is accurate and I agree to the Terms & Conditions of the auction platform." | [O] |
| FR-SELL-27 | "Submit Listing" is disabled until the certification checkbox is ticked. | [I] |

**Submission outcome (S11)**

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-SELL-28 | On submission the listing enters a **moderation queue**, not the live market: status "Under Review" / "Pending Approval". | [O] |
| FR-SELL-29 | A **Submission ID** is issued and displayed ("#AUC-29402"), with a submission date. | [O] |
| FR-SELL-30 | The review SLA is stated to the user: **"Typically reviews are completed within 4-6 hours."** | [O] |
| FR-SELL-31 | The user is told approval arrives by notification and prompted to enable notifications. | [O] |
| FR-SELL-32 | Listing lifecycle states are therefore at minimum: `draft → pending_approval → live → ended → sold | unsold`. **Rejection** is a required state (moderation implies refusal) but no rejection screen, reason display, or resubmission flow is designed. | [O] / [?] |
| FR-SELL-33 | Actions: "View My Listing" and "Back to Home". A seller-facing "my listings" view is implied by this and by the "8 Listed" profile stat, but **is not designed**. | [O] / [?] |

### 4.6 Notifications (S12)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-NOTIF-01 | A notification centre lists items newest-first, grouped by day ("Today", "Yesterday"). | [O] |
| FR-NOTIF-02 | Category filter tabs: **All, Bids, Alerts, Orders**. | [O] |
| FR-NOTIF-03 | **Clear All** bulk action. | [O] |
| FR-NOTIF-04 | Each item shows a type icon, title, relative timestamp, body text with the vehicle emphasised, and a chevron indicating it is tappable (deep link). | [O] |
| FR-NOTIF-05 | Notification types observed, with their triggers: **Outbid!** (`warning`) — you were outbid, includes new current bid; **New Bid Received** (`gavel`) — a bid landed on *your* listing, includes new price; **Ending Soon** (`schedule`) — "Auction ending in 5 mins"; **Payment Confirmed** (`check_circle`); **Account Update** (`info`) — e.g. KYC documents verified. | [O] |
| FR-NOTIF-06 | Notifications must deep-link to the relevant target (auction detail, order, profile). | [O] / [I] |
| FR-NOTIF-07 | Push delivery is required, not just in-app: S11 tells the user to keep notifications on to learn when bidding begins. | [O] / [I] |
| FR-NOTIF-08 | Read/unread state is implied by "Clear All" but no unread styling, badge count, or mark-as-read interaction is designed. S02/S05 show a bell icon with no badge. | [I] / [?] |
| FR-NOTIF-09 | Per-category notification preferences are implied by S13's "Auction Alerts" settings row. The preferences screen is **not designed**. | [O] / [?] |
| FR-NOTIF-10 | "Ending Soon" lead time is stated as 5 minutes in one example; whether this is fixed, user-configurable, or multi-stage is **undefined**. | [?] |

### 4.7 Account and profile (S13)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-ACCT-01 | Profile header: avatar, verified badge, display name ("Alex Sterling"), membership tier ("Gold Tier Member"), and tenure ("Since 2021"). | [O] |
| FR-ACCT-02 | Three headline stats: **Bids Won (12)**, **Active Bids (4)**, **Listed (8)** — each plausibly a link to a filtered list. | [O] |
| FR-ACCT-03 | A **membership tier** system exists ("Gold Tier"). Its levels, qualification criteria, and benefits are **entirely undefined**. | [O] / [?] |
| FR-ACCT-04 | Account Settings rows: **Personal Information** ("Name, email, and phone number"), **Payment Methods** (with the default shown: "Visa ending in •••• 4242"), **Identity Verification** ("Verified Status: Active"). | [O] |
| FR-ACCT-05 | Preferences rows: **Auction Alerts**, **Security**, **Help & Support**. | [O] |
| FR-ACCT-06 | **Logout** action. A confirmation step is expected for a destructive action. | [O] / [I] |
| FR-ACCT-07 | App version and build are displayed ("App Version 4.12.0 (Build 942)"). | [O] |
| FR-ACCT-08 | **All six settings destinations in FR-ACCT-04/05 are undesigned.** Payment Methods and Identity Verification in particular are substantial flows (card vault, document capture, liveness), not simple forms. | [?] |
| FR-ACCT-09 | Saved/watchlisted vehicles must be reachable — favouriting exists on S02 and S04 and "Saved"/"Watchlist" appears in two tab bars — but the collection screen is **not designed**. | [O] / [?] |

### 4.8 Financing and leasing (S14, S15, S16, S17)

#### Provider directory (S14)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-LEASE-01 | A directory compares third-party leasing providers as cards. | [O] |
| FR-LEASE-02 | Each provider card shows: name, positioning strapline, **Funding %** (LTV), **Rate %** (APR), **Term (years)**, and an "Apply Now" action. | [O] |
| FR-LEASE-03 | Observed providers: **Velocity Prime Capital** (85% / 6.4% / 5 yrs, "Instant digital verification", badged **Pre-Approved**), **Summit Global Leasing** (90% / 7.2% / 7 yrs, "Specializing in exotic collections"), **Elite Asset Credit** (75% / 5.9% / 4 yrs, "Tier 1 borrowers only"). | [O] |
| FR-LEASE-04 | A **Pre-Approved** badge is shown per provider, so pre-qualification is evaluated per user against each provider before application. | [O] |
| FR-LEASE-05 | Sort/filter chips: **Recommended, Lowest Rate, Max Tenure, Instant Approval**. "Recommended" implies a ranking algorithm that is **undefined**. | [O] / [?] |
| FR-LEASE-06 | Rate freshness is disclosed ("Rates updated 2 minutes ago"), implying near-real-time rate ingestion from provider APIs. | [O] / [I] |
| FR-LEASE-07 | Eligibility criteria such as "Tier 1 borrowers only" must be evaluable, and an ineligible/declined state must exist. **Not designed.** | [I] / [?] |

#### Lease application (S15)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-LEASE-08 | Field: **Identity Card Number** — free text. | [O] |
| FR-LEASE-09 | Field: **Leasing Amount ($)** — numeric. | [O] |
| FR-LEASE-10 | Field: **Lease Duration** — slider, 1–7 years, default 3, with live value readout. | [O] |
| FR-LEASE-11 | Field: **Expected Interest Rate (%)** — numeric, placeholder "e.g. 4.5". | [O] |
| FR-LEASE-12 | An **Estimated Monthly Payment** is computed live from amount, duration, and rate (shown at "$0.00" in the empty state). The amortisation formula must be specified and must match what the provider will actually contract. | [O] / [?] |
| FR-LEASE-13 | The form promises "real-time validation"; per-field validation rules are **undefined**. | [O] / [?] |
| FR-LEASE-14 | The application captures no income, employment, or asset data — insufficient for a real credit decision on a $215K facility. Either the provider collects it out-of-band or the flow is incomplete. | [?] |
| FR-LEASE-15 | The application is not linked to a specific vehicle or lot, yet S17's approval is vehicle-specific ("2024 Porsche 911 GT3 RS"). The binding between application and vehicle is **undefined**. | [?] |

#### Agent assignment (S16)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-LEASE-16 | On submission the user sees confirmation, a **Current Status** ("Review Phase"), and a **Reference ID** ("VEL-2049-LX"). | [O] |
| FR-LEASE-17 | A named **leasing agent** is assigned and profiled: name, title ("Senior Acquisition Specialist"), presence ("Online Now"), **Response Time** ("< 15 Mins"), **Experience** ("8+ Years"), and a personal message. | [O] |
| FR-LEASE-18 | Agent actions: **Direct Contact** (chat) and **Schedule Consultation** (calendar booking). **Both target screens are undesigned** — this implies an in-app messaging system and a scheduling system, each a significant subsystem. | [O] / [?] |
| FR-LEASE-19 | Agent presence must be live for "Online Now" to be truthful. | [O] / [I] |
| FR-LEASE-20 | Application status progression (Review Phase → ? → Approved) is partially visible: S17 shows the approved terminal state. Intermediate states, a status-tracking screen, and the declined state are **not designed**. | [O] / [?] |

#### Approved lease → bidding power (S17)

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-LEASE-21 | On approval the user sees the terms: **Monthly Payment $2,450/mo**, **Approved Limit $215,000**, **Lease Term 36 Months**, **Down Payment $15,000**. | [O] |
| FR-LEASE-22 | The approved lease is presented **against a live auction** — vehicle, lot ("Lot #4402 • Weissach Package"), **Current High Bid $192,500**, and **Your Max Bid $185,000**. | [O] |
| FR-LEASE-23 | A **bid stepper** (−/+ around $195,000) lets the user raise their max bid inline, committed via "Update My Bid". | [O] |
| FR-LEASE-24 | The stepper increment is not stated. It must be consistent with S04's increment tiers. | [?] |
| FR-LEASE-25 | The platform gives **financing advice**: "Based on your approval, you can safely bid up to $205,000 without increasing your down payment." This is a computed recommendation whose formula must be specified — and, being financial advice, carries regulatory and liability exposure that needs legal review. | [O] / [?] |
| FR-LEASE-26 | The relationship between **Approved Limit ($215,000)**, the **safe-bid ceiling ($205,000)**, and the **maximum enforceable bid** is undefined. Critically: **is a bid above the approved limit blocked, warned, or allowed?** | [?] |
| FR-LEASE-27 | FR-LEASE-22's "Your Max Bid" confirms proxy/max bidding exists in the data model, contradicting S04's increment-only bidding UI (see FR-BID-18). | [O] / [?] |

### 4.9 Dealer / facility onboarding (S18) — B2B

This screen is functionally distinct from consumer leasing and is best treated as a
separate module, despite sharing the Leasing chrome.

| ID | Requirement | Tag |
|----|-------------|-----|
| FR-DEALER-01 | Dealers complete a **facility profile** for **Inventory Management** to "unlock higher auction limits and premium financing tiers". | [O] |
| FR-DEALER-02 | Terms displayed: **Requested Credit $2.5M USD**, **Lease Term 5 YEARS**. Whether these are inputs or read-back values is unclear from the design. | [O] / [?] |
| FR-DEALER-03 | **Two required documents**, badged "2 REQUIRED": **Facility Inventory** (`.xlsx` or `.csv`, "Upload ... from your DMS") and **Operating License** (PDF, "Scanned copy of state certification"). | [O] |
| FR-DEALER-04 | Per-file states are shown: filename, status ("Ready to sync" / "Verified"), and a delete action. | [O] |
| FR-DEALER-05 | Uploaded inventory is machine-processed: "Our AI extracts VINs and values automatically. Review takes < 2 hours." | [O] |
| FR-DEALER-06 | A **DMS (Dealer Management System) inventory ingest** pipeline is therefore required — spreadsheet parsing, VIN extraction, valuation, and error reporting for malformed rows. Only the upload control is designed; **the entire ingest result, review, and correction experience is missing**. | [O] / [?] |
| FR-DEALER-07 | Submission is bound to separate **Dealer Terms**. | [O] |
| FR-DEALER-08 | Dealer accounts have **higher auction limits** and **premium financing tiers** — an account-type distinction with no representation anywhere else in the designs (S13's profile is purely consumer). | [O] / [?] |
| FR-DEALER-09 | Upload constraints (file size, row limits, virus scanning, re-upload of a rejected document) are **undefined**. | [?] |

---

## 5. Cross-cutting business rules

Collected here because they govern behaviour across screens and are the items most likely
to be mis-implemented if left implicit.

| ID | Rule | Source | Status |
|----|------|--------|--------|
| BR-01 | Buyer's premium is **5% of the winning bid**. | S07 | Observed; capping/tiering undefined |
| BR-02 | Payment must complete within **24 hours** of winning. | S06 | Observed; penalty undefined |
| BR-03 | A listing does not sell if the highest bid is below the **reserve price**. | S08 | Observed |
| BR-04 | Reserve status is publicly disclosed via a **"Reserve Met"** indicator. | S04 | Observed |
| BR-05 | New listings require **moderator approval** before going live. | S11 | Observed |
| BR-06 | Listing review SLA: **4–6 hours**. | S11 | Observed |
| BR-07 | Dealer document review SLA: **< 2 hours**. | S18 | Observed |
| BR-08 | Leasing agent response SLA: **< 15 minutes**. | S16 | Observed |
| BR-09 | Bid increments: **$10K / $25K / $50K / $100K**; default = $10K. | S04 | Observed; must scale by value |
| BR-10 | Bidder identities are **pseudonymised** in public bid feeds. | S04 | Observed |
| BR-11 | KYC verification gates bidding. | S12, S13 | Inferred |
| BR-12 | Auction close behaviour under last-second bids (**anti-sniping**). | — | **Undefined — must be decided** |
| BR-13 | Whether bids may exceed an approved lease limit. | S17 | **Undefined — must be decided** |
| BR-14 | Bid retraction / cancellation policy. | — | **Undefined — must be decided** |
| BR-15 | Seller listing fees or commission. | — | **Undefined** — only the buyer-side fee is designed |
| BR-16 | Currency and multi-jurisdiction tax handling. | S07, S18 | **Undefined** (USD assumed) |

---

## 6. Non-functional requirements

| ID | Requirement | Rationale |
|----|-------------|-----------|
| NFR-01 | **Real-time bid propagation.** Current bid, bid feed, and countdown must update without manual refresh; target end-to-end latency < 2s. | S04 live auction, S12 outbid alerts [I] |
| NFR-02 | **Server-authoritative time.** All countdowns derive from server time; client clocks must never determine auction close. | S04, S05 [I] |
| NFR-03 | **Bid atomicity.** Bid placement must be transactional and idempotent under concurrency; two bids at the same amount must have a deterministic winner. | [I] |
| NFR-04 | **Monetary precision.** No floating-point arithmetic for money; integer minor units throughout. Values reach $2.5M with cent-level fee lines. | S07 [I] |
| NFR-05 | **Push notification delivery** on iOS and Android, with deep links. | S11, S12 [O] |
| NFR-06 | **Transport security.** TLS everywhere; the app makes explicit "256-Bit SSL" and "256-bit Encrypted" claims to users. | S07 [O] |
| NFR-07 | **Document storage security.** KYC documents, operating licenses, and inventory files are sensitive; encrypted at rest, access-audited, retention-bounded. | S18, S13 [I] |
| NFR-08 | **PCI DSS scope containment.** Card data must never touch application servers; use a tokenising provider. | S07 [I] |
| NFR-09 | **Audit trail.** Every bid, listing state change, payment event, and document verification must be immutably logged — auction disputes at these values will require evidence. | [I] |
| NFR-10 | **Dark theme.** All 18 screens are dark-mode; a light theme is not designed and must not be assumed. | Observed across all screens [O] |
| NFR-11 | **Accessibility.** Target WCAG 2.2 AA: the current designs rely on colour-only status signalling (Winning/Outbid) and place small-target icon buttons in headers; both need remediation. | [I] |
| NFR-12 | **Performance.** Image-dense grids at 2.5MB-class hero photography require responsive image variants, lazy loading, and caching. | S02 [I] |
| NFR-13 | **Offline and error resilience.** Every screen needs loading, empty, and error states; none are currently designed. | [I] |
| NFR-14 | **Localisation readiness.** Currency, units (km vs miles — see §11.8), and date formats must be externalised. | S07, S08 [I] |

---

## 7. Proposed data model

Entities and fields inferred from the designed screens. Field lists are the *minimum*
implied by the UI, not a complete schema.

**User** — id, email, password_hash, display_name, avatar_url, membership_tier, member_since,
kyc_status, phone, account_type (consumer | dealer), created_at
· *derived stats:* bids_won, active_bids, listings_count

**Vehicle / Listing** — id, seller_id, asset_id (display), lot_number, make, model, year,
mileage + mileage_unit, category, body_style, engine, transmission, drivetrain, fuel_type,
exterior_color, interior_color, previous_owners, has_service_history, has_accident_history,
description, location, condition_report_url, status (`draft | pending_approval | live |
ended | sold | unsold | rejected`), submission_id, submitted_at, created_at

**ListingPhoto** — id, listing_id, url, position, is_hero

**Auction** — id, listing_id, starting_bid, reserve_price, reserve_met, current_bid,
bid_count, starts_at, ends_at, status, winner_id, winning_bid

**Bid** — id, auction_id, bidder_id, amount, max_amount (proxy), placed_at, status
(`active | outbid | winning | won | lost`)

**Watchlist** — user_id, listing_id, created_at

**Order** — id, auction_id, buyer_id, lot_number, winning_bid, auction_fee, documentation_tax,
total_amount, payment_method (`wire | card | crypto`), payment_status, payment_due_at
(= won_at + 24h), shipping_address_id, delivery_type, insured, created_at

**Address** — id, user_id, line1, city, state, postal_code, country, is_default

**Notification** — id, user_id, type (`outbid | new_bid | ending_soon | payment_confirmed |
account_update`), category (`bids | alerts | orders`), title, body, target_ref, read_at,
created_at

**LeaseProvider** — id, name, tagline, funding_percentage, interest_rate, max_term_years,
instant_approval, rates_updated_at

**LeaseApplication** — id, user_id, provider_id, listing_id (nullable — see FR-LEASE-15),
identity_card_number, requested_amount, duration_years, expected_interest_rate,
estimated_monthly_payment, status (`review | approved | declined`), reference_id,
assigned_agent_id, created_at

**LeaseApproval** — application_id, approved_limit, monthly_payment, term_months,
down_payment, safe_bid_ceiling

**LeasingAgent** — id, name, title, avatar_url, response_time_sla, years_experience,
presence_status

**DealerFacility** — id, user_id, requested_credit, lease_term_years, status, submitted_at

**DealerDocument** — id, facility_id, doc_type (`inventory | operating_license`), filename,
file_url, status (`uploaded | ready_to_sync | verified | rejected`), processed_at

---

## 8. Design system (as built in the mockups)

### 8.1 Declared project theme

From Stitch project metadata: `colorMode: LIGHT`, `font: MANROPE`, `roundness: ROUND_EIGHT`,
`customColor: #f47b25`, `saturation: 3`.

**The declared theme does not match the screens.** All 18 screens are dark, and the declared
orange `#f47b25` appears on exactly one screen (S01, login).

### 8.2 Token sets actually present

Three different palettes are in use:

| Set | Primary | Surfaces | Used by |
|-----|---------|----------|---------|
| **A — Auction core** (12 screens) | `#135bec` blue | `#101622` bg, `#192233` card, `#f6f6f8` text, `#324467` / `#92a4c9` muted | S02–S13 |
| **B — Leasing** (5 screens) | `#b4c5ff` periwinkle | `#11131b` bg, `#e1e1ee` text, `#32343e` / `#414755` muted, `#ffb59b` accent | S14–S18 |
| **C — Login** (1 screen) | `#f47b25` orange | `#221710` bg, `#f8f7f5` text | S01 |

Typography: **Manrope** on 17 screens, **Space Grotesk** on S06 only. Icons: Material Symbols
Outlined throughout (consistent).

**FR-DS-01 [?]** One palette must be chosen and applied to all screens before build. Set A
is the pragmatic default — it covers two-thirds of the app including every core auction
screen. Set C's orange is the *declared brand colour*, so the decision is genuinely a brand
question, not a cleanup task: either restyle S01 to blue, or restyle 17 screens to orange.

**FR-DS-02 [?]** S06's Space Grotesk must be reconciled to Manrope unless the celebration
screen is deliberately off-system.

**FR-DS-03 [I]** Extract the observed values into design tokens (colour, type scale, spacing,
radius `ROUND_EIGHT` = 8px, elevation) before component work begins.

---

## 9. Assumptions

1. The application is **mobile-native or mobile-web only**; no desktop or tablet designs exist.
2. **USD** is the only currency; a single jurisdiction is assumed for tax.
3. The **Bidder and Seller are one account type**, distinguished by activity rather than role.
4. Leasing providers are **third parties** integrated by API; CarBid does not underwrite.
5. Vehicle listings are **individually unique** (no quantity/inventory concept on the consumer side).
6. Auctions are **timed** (fixed end time), not live/simultaneous-bidding events.
7. The Stitch designs are **current and approved as visual direction**, notwithstanding the
   inconsistencies in §11.

---

## 10. Recommended build sequence

Ordered by dependency, not by screen count.

| Phase | Contents | Blocked on |
|-------|----------|------------|
| **0 — Decisions** | Resolve §11 (brand, palette, nav, wizard steps, currency scale) and BR-12/BR-13/BR-14 | Product owner |
| **1 — Foundation** | Design tokens, component library, auth (S01 + undesigned register/reset), session, KYC gate | Phase 0 |
| **2 — Discovery** | S02, S03, watchlist, search infrastructure, image pipeline | Phase 1 |
| **3 — Bidding core** | S04, S05, real-time layer, bid atomicity, anti-sniping, audit log | Phase 2 |
| **4 — Post-auction** | S06, S07, payment integrations, order + delivery tracking | Phase 3 |
| **5 — Selling** | S08–S11, wizard step 3, drafts, moderation queue (staff tooling) | Phase 2 |
| **6 — Notifications** | S12, push infrastructure, preferences | Phase 3 |
| **7 — Account** | S13 and its six undesigned sub-screens | Phase 1 |
| **8 — Financing** | S14–S17, provider integrations, messaging, scheduling | Phase 3 |
| **9 — Dealer (B2B)** | S18, DMS ingest pipeline, dealer account type | Phase 8 |

Phases 8 and 9 are separable products. If scope must be cut, cutting financing entirely
removes 5 of 18 screens and two whole external-integration surfaces (provider rate APIs,
in-app messaging + scheduling) without touching the core marketplace.

---

## 11. Inconsistencies requiring resolution

These are defects in the current design set. Each one will otherwise be resolved
arbitrarily — and differently — by whoever implements the screen.

### 11.0 Decisions log

Four decisions were taken on 2026-08-04. The affected items below are marked **RESOLVED**;
the design changes needed to realise them are specified in
[`STITCH-FIX-PROMPTS.md`](STITCH-FIX-PROMPTS.md).

| Item | Decision |
|------|----------|
| 11.1 Brand name | **CarBid** on all screens. Third-party leasing provider names ("Velocity Prime Capital", "Summit Global Leasing", "Elite Asset Credit") are preserved — they are vendors, not the platform, and keeping them actually removes the Velocity/Velocity ambiguity. |
| 11.2 Palette | **Blue `#135bec` dark system.** Restyles 6 screens (login + the 5 leasing screens). The declared orange `#f47b25` is retired. |
| 11.6 Currency | **Plain dollars with K/M abbreviations.** "Millions" units removed from the price filter and the reserve-price field. |
| 11.5 Sell wizard | **Four steps.** New step 3 "Condition & Documentation" (design generated — see `design/generated/`). Body Style, Location, Starting Bid and Auction Duration added to step 1. |

Consequent requirement changes: FR-DISC-10 and FR-SELL-07 adopt plain dollars; FR-SELL-09
is satisfied by the new step-1 Auction Setup section; FR-SELL-22 is satisfied by the new
step 3; FR-SELL-23 and FR-SELL-25 are satisfied by the new step-1 Location and Body Style
fields; FR-DS-01 resolves to blue. FR-BID-07's condition report now has a capture path.

Note also: the **project-level theme is stale** — it declares `LIGHT` / `#f47b25` while the
design system correctly declares `DARK` / `#135bec`. Align the project theme to the design
system.

**11.1 — Three competing brand identities. [RESOLVED → CarBid]** S01 says **"AUTO BID — Premium Auctions"**,
S02 says **"LUXE AUCTIONS"**, S14–S18 say **"Velocity Auction"** (with a logo asset and
"Velocity Prime Capital", "Velocity Verification", reference prefix `VEL-`). The project is
named CarBid. **Four names for one product.** Blocks all header, splash, and store work.

**11.2 — Three palettes. [RESOLVED → blue #135bec]** See §8.2. The declared brand colour is used on one screen.

**11.3 — Five tab bar configurations.** See §3.1. No two modules agree on the destinations.

**11.4 — Font inconsistency.** Space Grotesk on S06, Manrope elsewhere.

**11.5 — Sell wizard step count is incoherent. [RESOLVED → 4 steps + new step 3]** S08 "Step 1 of 3" → S09 "Step 2 of 4,
50% Complete" → S10 "Step 4 of 4". A 4-step wizard is 50% complete at step 2, so S09's
progress is self-consistent with a 4-step flow and S08's "of 3" is wrong. **Step 3 does not
exist in any form.** Additionally, three fields appear in the review screen that are never
captured: **Body Style**, **Location**, and **Starting Bid**.

**11.6 — Currency scale contradiction. [RESOLVED → plain dollars]** S03's price filter is labelled "Price Range
(Millions)" with bounds `0M–500M+` and an active range of `12M–450M`; S08's reserve price is
suffixed "Millions". Taken literally these describe vehicles priced up to **$500 million**.
Actual listing prices are $450K–$2.5M. Either the "Millions" labels are wrong, or the slider
bounds are wrong by three orders of magnitude. This will produce real mispriced listings if
shipped as drawn.

**11.7 — The same vehicle carries different prices on different screens.** The 2022 Ferrari
SF90 is **$2,500,000** in both S02 and S04, but S12's outbid notification for it says
"Current bid: $542,000" — a 4.6× discrepancy for one named vehicle. Comparable models are
also two orders of magnitude apart across screens: a 911 GT3 is **$1.2M** in S02 (2023) and
**$145,000** in S05 (2022). Mock-data inconsistency rather than a functional defect — but it
means no screen can be trusted as a source for realistic value ranges, and the increment
tiers in BR-09 cannot be calibrated from the designs.

**11.8 — Mileage units diverge.** S08 captures mileage in **km**; S02 and S04 display
**miles**. No conversion is indicated.

**11.9 — Consumer and B2B flows share one navigation.** S18 is dealer facility financing
(inventory spreadsheets from a DMS, state operating licenses, $2.5M credit lines, "higher
auction limits") rendered inside the consumer Leasing tab. Its own title, "Agent: Document
Upload", describes neither its content nor its actor. Dealer onboarding needs either its own
entry point and account type, or removal from this release.

**11.10 — Four incompatible identifier formats.** `Asset ID: #FER-SF90-0042` (S04),
`Lot #8812` (S07), `Lot #4402` (S17), `ID: #77291` (S06), `Submission ID: #AUC-29402` (S11),
`Reference ID: VEL-2049-LX` (S16). Some of these are genuinely different entities (listing vs
lot vs order vs application), but the naming does not distinguish them and the user-facing
formats are unrelated to each other. Define one identifier scheme per entity.

**11.11 — Proxy bidding exists on one screen only.** S17 shows "Your Max Bid" and a max-bid
stepper; S04's bidding UI has no max-bid concept, only increments. Either proxy bidding is a
feature (and S04 is missing it) or S17 is mislabelled.

**11.12 — Category lists diverge.** Browse offers Cars/Vans/Bikes/Trucks/**Electric** (S02);
listing creation offers Cars/Vans/Bikes/Trucks (S09 select). "Electric" is also a fuel type
(FR-SELL-13), so it is a taxonomy error, not just a missing option.

**11.13 — Spec enumerations cannot describe the inventory.** No Engine Type option matches
the Ferrari's "4.0L V8 Hybrid" or the Porsche's "3.0L Twin-Turbo H6"; no Transmission option
matches "8-Speed PDK" or "8-Speed DCT". Sellers of exactly the cars this app showcases
cannot describe them.

---

## 12. Missing screens and flows

Nothing below is designed. Items marked **⛔** block a designed flow from functioning
end-to-end and must be resolved before that flow can ship.

**Identity**
- ⛔ Registration / create account (linked from S01)
- ⛔ Forgot password + reset (linked from S01)
- ⛔ Login failure / locked account states
- ⛔ KYC document capture and verification flow (a verified *status* is displayed in two places)
- MFA / step-up authentication for high-value actions

**Core navigation**
- ⛔ Home / dashboard (a tab destination on 4 screens; "Back to Home" on S11)
- ⛔ Watchlist / Saved collection (a tab destination; favouriting exists on S02 and S04)
- ⛔ Search results and search empty state (distinct from the browse grid)
- Expanded brand picker ("+12 More" on S03)

**Bidding**
- ⛔ Bid confirmation, bid success, and bid rejected/outbid-on-submit states
- ⛔ Quick Bid confirmation (S05 places a bid in one tap)
- ⛔ Auction ended / auction lost / reserve not met
- ⛔ My Bids → History tab contents
- Condition report viewer (S04 links to it)
- Empty states for Active bids

**Post-auction**
- ⛔ Wire transfer instructions, card entry, and crypto payment sub-flows (S07 selects a method but never collects it)
- ⛔ Payment processing / success / failure
- ⛔ Order detail and delivery tracking (S12 references shipping details)
- Shipping address add/edit (S07 has an "Edit" button)

**Selling**
- ⛔ Sell wizard **step 3** (does not exist)
- ⛔ Capture for Body Style, Location, and Starting Bid (shown in review, never collected)
- ⛔ Photo picker / upload / reorder experience (S08 has only a "Select Images" button)
- ⛔ My Listings (linked from S11 "View My Listing"; implied by the "8 Listed" stat)
- ⛔ Listing rejected + reasons + resubmit
- Drafts list and resume (S08 shows a "Drafts" affordance)

**Account (all six S13 destinations)**
- ⛔ Personal Information editor
- ⛔ Payment Methods management (a default card is displayed)
- ⛔ Identity Verification detail
- ⛔ Notification preferences ("Auction Alerts")
- Security settings
- Help & Support
- Logout confirmation

**Financing**
- ⛔ In-app chat with leasing agent ("Direct Contact")
- ⛔ Consultation scheduling ("Schedule Consultation")
- ⛔ Lease application status tracking and the declined state
- Provider detail / terms disclosure

**Dealer**
- ⛔ Dealer entry point and account registration
- ⛔ Inventory ingest results, VIN extraction review, and row-level error correction
- ⛔ Document rejected / re-upload
- Dealer inventory management dashboard (S18's stated purpose)

**Cross-cutting**
- ⛔ Loading, empty, and error states — *for every screen*
- Offline / no-connectivity handling
- Terms of Service, Refund Policy, Dealer Terms documents (all three are linked)
- Onboarding / first-run experience
- App settings, legal, and about

---

## 13. Traceability

| Module | Screens | Requirement IDs |
|--------|---------|-----------------|
| Navigation | all | FR-NAV-01..03 |
| Identity & access | S01 | FR-AUTH-01..11 |
| Discovery | S02, S03 | FR-DISC-01..18 |
| Bidding | S04, S05 | FR-BID-01..25 |
| Post-auction | S06, S07 | FR-POST-01..16 |
| Selling | S08–S11 | FR-SELL-01..33 |
| Notifications | S12 | FR-NOTIF-01..10 |
| Account | S13 | FR-ACCT-01..09 |
| Financing | S14–S17 | FR-LEASE-01..27 |
| Dealer (B2B) | S18 | FR-DEALER-01..09 |
| Design system | all | FR-DS-01..03 |
| Business rules | cross-cutting | BR-01..16 |
| Non-functional | cross-cutting | NFR-01..14 |

**Totals:** 18 screens · 164 functional requirements · 16 business rules · 14 non-functional
requirements · 13 design inconsistencies · ~45 undesigned screens and flows.

---

## 14. Immediate next steps

1. **Resolve §11 with the product owner.** Items 11.1 (brand), 11.5 (wizard), and 11.6
   (currency scale) block implementation outright.
2. **Decide the three undefined auction rules** — BR-12 anti-sniping, BR-13 lease-limit
   enforcement, BR-14 bid retraction. These are policy, not engineering, and they shape the
   data model.
3. **Confirm scope for v1.** Recommendation: ship phases 1–7 (core marketplace + selling);
   defer financing (§8) and dealer (§9) to v2. That removes 6 screens and the two largest
   integration surfaces.
4. **Commission the ⛔ screens in §12** for whatever scope survives step 3.
5. **Then** proceed to architecture and API design against this document.
