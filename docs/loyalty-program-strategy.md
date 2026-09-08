# Google Merchant Center Loyalty Add-on — Plan for Radio-Controlled.co.uk

Context: the Merchant Center add-on at `merchants.google.com/mc/addons/discover?a=5830361807&addon=11`
is the **Loyalty program** add-on. This doc decides what we plug into it, how we test it, and what
happens to the existing refer-a-friend scheme.

---

## 1. What the add-on actually is (and isn't)

It is a **display layer, not a loyalty engine**. Google doesn't run a programme for us, doesn't store
members, doesn't issue rewards. We keep running the programme; Google reads it from Merchant Center +
our product feed and annotates our listings with it.

Where the annotations show: Shopping ads, free listings, local inventory ads, across Search, the
Shopping tab, AI surfaces and Google Wallet. There is no fee to enable it.

**Google supports exactly three benefit types:**

| Benefit | What shoppers see | Feed plumbing |
|---|---|---|
| Member price | Member price shown next to the regular price ("member price £x") | `loyalty_program.price` |
| Loyalty points | Points earned on the item | `loyalty_program.loyalty_points` |
| Member shipping | Free / free same-day delivery for members, optionally over a threshold | `loyalty_program.shipping_label` + a member shipping policy |

**Refer-a-friend is not one of them.** There is no referral benefit type, so our current programme
cannot be surfaced by this add-on in any form. That's the core finding: to use `addon=11` at all we
have to add a joinable membership that grants at least one of the three benefits above. Referral
doesn't get deleted — it gets repositioned (§5).

### Hard rules worth knowing before we design anything

- Member discount must be **≥5% or ≥5 currency units** off the regular/sale price, or Google simply
  won't render the member price. There is no "1% member price" play.
- `loyalty_program.price` must never exceed the regular `price`.
- Member prices go **only** in the `loyalty_program` attribute — never in `price` or `sale_price`.
- `program_label` and `tier_label` in the feed must match Merchant Center **exactly, case-sensitive**.
- `member_price_effective_date` is ISO 8601.
- Customer Match lists in Google Ads are required for the personalised, signed-in-member annotations
  (member shipping and green strikethrough to known members). Set them up regardless.
- UK is in scope — the feature covers 14 countries including the UK, so we're eligible today.

Reference benchmark: Sephora reported ~20% CTR lift on personalised loyalty annotations for
signed-in members. Treat that as a ceiling for a big brand with a mature programme, not our forecast.

---

## 2. Recommendation: launch "RC Club", shipping-benefit first

**Single free tier at launch. Headline benefit = delivery. Points as the retention hook. Member
pricing only on a hand-picked SKU set.**

Proposed structure:

- **Join:** free, email + account creation. No paid tier at launch (a paid tier is v2 once we know
  the annotation moves anything).
- **Benefit 1 — Member delivery:** free UK standard delivery for members over **£49** (vs £129.99 for
  everyone else). This is the strongest lever we have and costs nothing on orders we'd otherwise lose.
- **Benefit 2 — Points:** 1 point per £1, 100 points = £5 off. Renders on every eligible SKU in the
  feed, so it annotates the whole catalogue without touching a single price.
- **Benefit 3 — Member price:** pilot set only (see §4), never catalogue-wide.

### Why delivery, not price, is the headline

1. Our free-delivery threshold is £129.99. A large share of RC demand is **spares, tyres, servos,
   batteries and hop-ups under £50** — exactly where postage is a meaningful % of basket and where we
   lose the click to whoever ships cheaper. Dropping the member threshold to £49 targets the traffic
   that is currently bouncing on delivery cost, not the traffic that already converts.
2. Spares are inherently repeat-purchase. Delivery benefit + points compound: the member comes back
   for the next part because the postage maths only works for them here.
3. RC is RRP/MAP-sensitive with distributor-set pricing on Kyosho, ARRMA, Tamiya, Team Associated,
   HPI, FTX etc. A catalogue-wide member price at the mandatory ≥5% just hands margin to customers who
   were already going to buy, and risks distributor friction. Delivery is a benefit we control.
4. Points annotate everything at zero unit-margin cost and give us the on-site mechanic that makes
   membership worth joining after the first order.

### Where member pricing does earn its place

Restrict to SKUs where 5%+ is affordable and where we actually want the visibility fight:
own-brand/unbranded accessories, high-margin consumables, ageing stock we'd discount anyway, and
head-term competitive SKUs where we're currently losing impression share.

---

## 3. Delivery plan

**Phase 0 — Decide & prep (week 0–1)**
- Confirm the on-site platform's ability to (a) hold member state, (b) apply a member shipping rule,
  (c) emit the `loyalty_program` group into the Merchant Center feed. This is the one real
  dependency: some feed plugins/apps don't yet write the group attribute and we'd need a supplemental
  feed instead.
- Build the Customer Match list in Google Ads (customer email list, hashed on upload) and set up an
  ongoing sync so new members flow in. Required for personalised annotations.
- Lock the exact strings: `program_label` = `RC Club`, `tier_label` = `Member`. Write them down; they
  are case-sensitive in two places.

**Phase 1 — On-site membership (week 1–3)**
- Join/landing page with the three benefits and T&Cs (Google reviews the programme details we submit,
  so the public page and the submitted description must agree).
- Member state on the account, points ledger, £49 member shipping rule at checkout.
- PDP shows the member price and points where applicable — plus `MemberProgram` structured data so
  the same benefits are eligible in organic Search results, not just ads.

**Phase 2 — Merchant Center (week 3–4)**
- Enable the Loyalty program add-on, submit programme name, tiers, benefit details and the join URL
  for review.
- Configure the member shipping policy after programme approval.
- Push `loyalty_points` catalogue-wide in the feed; push `loyalty_program.price` on the pilot SKU set
  only, with `member_price_effective_date` bounding the test window.
- Validate: no member price leaked into `price`/`sale_price`, no member price above regular price,
  labels matching, ≥5%/£5 gap on every pilot SKU.

**Phase 3 — Measure (week 4–10)**
- Merchant Center **Loyalty program performance report** for annotation visibility and engagement.
- Google Ads for the commercial numbers.

Supplemental-feed fallback if the platform can't emit the attribute: generate the `loyalty_program`
group as a separate supplemental feed keyed on `id`, uploaded on a schedule. Slower to iterate but
unblocks the pilot without a platform migration.

---

## 4. Test design

The annotation can't be split-tested per-impression, so run a **SKU holdout**:

- **Pilot set:** 150–300 SKUs carrying `loyalty_program.price`.
- **Control set:** matched SKUs — same category, same price band, similar 90-day impressions, clicks
  and conversion rate — carrying points only, no member price.
- **Window:** 4–6 weeks minimum, avoiding a promo period or Black Friday distorting either side.

Read-out metrics, in priority order:

1. **Contribution margin per click** (the guardrail — member pricing can lift CTR and still lose money)
2. CTR and impression share on pilot vs control
3. Conversion rate and AOV
4. Member sign-up rate, and share of orders placed by members
5. 90-day repeat purchase rate, members vs non-members

Ship-it criteria: pilot CTR up ≥10% vs control **and** contribution margin per click flat or better.
If CTR moves but margin per click drops, the answer is to keep points + delivery and drop member
pricing — that's a valid, cheap outcome, not a failed test.

Separately, measure the delivery benefit on its own: member free delivery at £49 should show up as a
lift in sub-£130 basket conversion and in orders per member per quarter. That's an on-site read, not
a Merchant Center one.

---

## 5. What happens to refer-a-friend

Keep it, and wire it into RC Club instead of running it alongside:

- Referral reward becomes **points credited to the referrer's RC Club balance**, referee gets a
  joining bonus. One currency, one ledger, one thing to explain.
- Referral becomes the **acquisition** mechanic; RC Club becomes the **retention** mechanic; the
  Google add-on becomes the **visibility** mechanic that neither had before.
- The referral scheme's real weakness today is that it does nothing for someone who has never heard of
  us — it only activates existing customers. The Google annotation is the opposite: it works on cold
  traffic in the auction. They're complements, not alternatives.

---

## 6. Alternatives considered

| Option | Verdict |
|---|---|
| Keep referral only, skip the add-on | Leaves free ad real estate on the table; referral is invisible to Google |
| Catalogue-wide member pricing | Rejected — mandatory ≥5% across RRP-controlled stock is a margin giveaway |
| Points only, no delivery/pricing benefit | Cheapest to ship, weakest hook; fine as a fallback if platform work is blocked |
| Paid membership tier (e.g. £19/yr, free delivery always) | v2. Test the free tier first; a paid tier with a real annotation behind it is a much easier sell once we have the CTR data |
| Promotions/special-offer annotations instead | Different feature, not mutually exclusive — worth running in parallel, but it's a one-off discount rather than a retention asset |

---

## 7. Open items

- Which ecommerce platform / feed tool are we on? Decides native support vs supplemental feed.
- Do we have an existing points/rewards system, or does RC Club start from zero?
- Margin floor per category, to pick the pilot SKU set.
- Who owns the Customer Match sync and its refresh cadence.

## Sources

- [About merchant loyalty program](https://support.google.com/merchants/answer/12827255)
- [Loyalty program updates: expanded loyalty features](https://support.google.com/merchants/answer/16986038)
- [Loyalty program [loyalty_program] attribute spec](https://support.google.com/merchants/answer/12922446)
- [Step 3.1: Set up member pricing](https://support.google.com/merchants/answer/16465657)
- [Step 3.2: Set up member shipping](https://support.google.com/merchants/answer/15500486)
- [Loyalty program performance report](https://support.google.com/merchants/answer/15585221)
- [MemberProgram structured data](https://developers.google.com/search/docs/appearance/structured-data/loyalty-program)
- [Google expands loyalty features to 14 countries](https://searchengineland.com/google-expands-merchant-center-loyalty-features-to-14-countries-and-ai-surfaces-473122)
