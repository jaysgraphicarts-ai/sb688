# Resilience Council SEO Architecture

## Positioning

The public website explains a production incident-governance and recovery-control system. It must never claim to be unhackable, autonomous national infrastructure, government-approved, or independently certified unless documentary proof is published.

Primary category: resilience governance software.
Secondary categories: incident command software, continuity management, recovery orchestration, tamper-evident audit logging, quorum decision systems.

## Search architecture

### Public indexable routes

- `/` Category and product overview
- `/platform` Architecture and capabilities
- `/incident-governance` Incident lifecycle and quorum decisions
- `/audit-integrity` Hash-chain audit model and verification method
- `/recovery-control` Authorized recovery requests and execution boundary
- `/security` Security model, RLS, authentication, limitations, disclosure policy
- `/proof` Reproducible test results, test methodology, build status, and version history
- `/docs` Public technical documentation hub
- `/docs/getting-started`
- `/docs/architecture`
- `/docs/security-model`
- `/docs/audit-chain`
- `/docs/api`
- `/research` Original resilience and verification research
- `/about` JGA Enterprises and project ownership
- `/contact`
- `/privacy`
- `/terms`

### Non-indexable application routes

- `/app/*`
- `/login`
- `/admin/*`
- `/account/*`
- `/incidents/*`
- `/decisions/*`

These routes must send `noindex, nofollow`, remain absent from XML sitemaps, and require authentication where applicable.

## Topic clusters

### Resilience governance

Pillar: `resilience governance software`
Supporting topics: incident command workflow, operational continuity, decision quorum, evidence-based incident response, recovery authorization.

### Tamper-evident auditability

Pillar: `tamper-evident audit log`
Supporting topics: hash chaining, append-only audit events, audit verification, evidence integrity, database audit architecture.

### Recovery control

Pillar: `recovery orchestration software`
Supporting topics: approved recovery actions, rollback governance, recovery runbooks, recovery evidence, failure containment.

### Verification-first architecture

Pillar: `verification-first computing architecture`
Supporting topics: trusted state, quarantine before commit, policy gates, RLS security, proof generation, reproducible tests.

## Content quality standard

Every technical page must contain:

1. A plain-language explanation.
2. A precise mechanism description.
3. A threat or failure model.
4. What is implemented now.
5. What remains unproven or outside the boundary.
6. Reproducible evidence or source references.
7. A version and last-reviewed date.

No doorway pages, mass-generated filler, keyword stuffing, fake reviews, fake certifications, fake government association, or hidden AI-targeting text.

## Technical SEO

- Server-render or prerender every public marketing and documentation page.
- Use one canonical HTTPS hostname.
- Enforce lowercase, extensionless URLs with one trailing-slash policy.
- Return real 404 and 410 status codes.
- Generate an XML sitemap containing canonical public URLs only.
- Publish `robots.txt` with sitemap location and blocked private paths.
- Use unique title, meta description, canonical, Open Graph, and social metadata per page.
- Maintain semantic heading order and accessible landmark structure.
- Set image width and height, modern formats, descriptive alt text, and lazy-load below-fold media.
- Keep critical content available in rendered HTML, not hidden behind client-only JavaScript.
- Target strong Core Web Vitals and test mobile first.
- Add redirects for every changed public URL.
- Add breadcrumbs to documentation and research pages.
- Add accurate `lastmod` values from content revision timestamps.

## Structured data graph

Use a stable `@graph` with IDs rooted at the canonical domain:

- `Organization` for JGA Enterprises
- `WebSite` for the public site
- `SoftwareApplication` for Resilience Council
- `WebPage` per page
- `BreadcrumbList` on nested pages
- `TechArticle` for technical documentation and research
- `FAQPage` only where visible questions and answers are truly present

Do not publish aggregate ratings, reviews, prices, certifications, awards, or government affiliations unless they are visible and verifiable.

## Entity and AI-search visibility

- Use one consistent product name, owner name, organization name, and description.
- Publish concise definition blocks that can be quoted without losing context.
- Separate facts, engineering hypotheses, reported test results, and independently validated results.
- Publish original diagrams, benchmarks, test protocols, changelogs, and source-linked proof.
- Earn citations through useful technical material rather than manufactured backlinks.
- Provide author, reviewer, revision date, and evidence source on technical pages.

## Measurement

Track:

- Search Console and Bing Webmaster indexing coverage
- Branded and non-branded impressions
- Qualified organic visits to documentation and proof pages
- Demo or contact conversion rate, without adware or intrusive popups
- Crawl errors, canonical conflicts, structured-data validity
- Core Web Vitals by route type
- Referring domains to proof and research pages
- AI-search citations and referral traffic where measurable

## 90-day execution

### Days 1-14

Ship canonical routing, metadata system, sitemap, robots controls, structured data, analytics consent, Search Console, Bing Webmaster Tools, security page, proof page, and baseline performance report.

### Days 15-45

Publish four pillar pages and eight supporting technical articles. Add architecture diagrams, reproducible audit-chain verification, threat model, and public changelog.

### Days 46-90

Publish case-study format validation reports, improve internal linking using query data, acquire legitimate technical references, and refresh pages with measured weak impressions or poor conversion.

## Release gates

A public page cannot ship when it has duplicate metadata, a missing canonical, inaccessible primary content, unsupported claims, invalid structured data, broken internal links, private data, exposed secrets, or a Lighthouse/field-performance regression without an accepted engineering waiver.
