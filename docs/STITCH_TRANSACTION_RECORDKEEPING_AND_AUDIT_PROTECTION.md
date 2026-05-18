# JGA Stitch Hive Mind — Tenant Transaction Recordkeeping and Audit Protection

## Purpose

Every Business Brick must keep detailed, organized, tenant-scoped records for every transaction, activity, document, tax-relevant event, compliance event, subscription event, workflow event, HR/session event, and export/download action.

The purpose is to protect both:

- the tenant business, by giving them clean records, easy search, exports, and compliance readiness;
- JGA, by proving what the system did, what the tenant did, what JGA did not do, what was automated, what required human review, and what was outside JGA responsibility.

---

## Core Responsibility Boundary

Each business remains responsible for its own taxes, filings, licenses, legal compliance, bookkeeping review, professional advice, and final record accuracy.

JGA Stitch may provide software for:

- record capture;
- record organization;
- transaction logging;
- memory braiding;
- compliance reminders;
- tax-prep exports;
- audit trails;
- safe document storage;
- accountant/legal handoff packages;
- operational reports.

JGA Stitch does not replace a licensed accountant, attorney, payroll provider, tax professional, registered agent, insurance agent, or government agency.

---

## Every Transaction Must Be Recorded

Every transaction inside a Business Brick should create a structured record.

Transaction examples:

- sale;
- invoice;
- quote;
- estimate;
- payment;
- refund;
- discount;
- subscription charge;
- expense;
- receipt upload;
- purchase order;
- client deposit;
- job milestone;
- file upload/download;
- design proof approval;
- revision request;
- contractor payout support record;
- payroll support record;
- tax-related adjustment;
- compliance event.

---

## Required Transaction Fields

Each transaction record should include:

- transaction_id;
- tenant_id;
- brick_id;
- business_name;
- state;
- county/city if relevant;
- industry;
- timestamp_created;
- timestamp_updated;
- actor_id;
- actor_role;
- customer/client id if applicable;
- vendor id if applicable;
- transaction_type;
- transaction_status;
- amount;
- currency;
- tax_amount;
- discount_amount;
- fees;
- payment_method;
- payment_processor_reference;
- invoice_id;
- receipt_id;
- job_id;
- project_id;
- category;
- tax_category;
- compliance_category;
- source_system;
- source_file_hash;
- attachment_ids;
- notes;
- sensitivity_level;
- retention_policy;
- verification_status;
- reviewed_by;
- review_timestamp;
- ledger_hash;
- previous_ledger_hash.

---

## Easy-To-Find Structure

Records should be organized by:

```text
Tenant
  ↓
State
  ↓
Business Brick
  ↓
Year
  ↓
Quarter
  ↓
Month
  ↓
Record Type
  ↓
Transaction / Document / Activity
```

Recommended vault path model:

```text
/tenants/{tenant_id}/states/{state}/bricks/{brick_id}/years/{yyyy}/quarters/Q{n}/months/{mm}/{record_type}/{record_id}.json
```

Human-readable index views should support:

- search by client;
- search by vendor;
- search by invoice;
- search by job;
- search by date;
- search by state;
- search by tax category;
- search by compliance category;
- search by payment status;
- search by missing documents;
- search by review status;
- search by audit flag.

---

## Record Types

Minimum record folders/categories:

- transactions;
- invoices;
- receipts;
- expenses;
- payments;
- refunds;
- subscriptions;
- client files;
- vendor files;
- contracts;
- tax records;
- sales tax records;
- payroll support;
- contractor support;
- HR sessions;
- compliance notices;
- licenses/permits;
- filings;
- memory uploads;
- memory downloads;
- AI outputs;
- owner approvals;
- tenant approvals;
- audit reports;
- exports.

---

## Audit Protection System

The audit protection system protects JGA by proving:

1. the tenant is responsible for final tax/legal compliance;
2. the system provided organization and reporting tools;
3. sensitive actions required tenant/owner/human approval;
4. records were stored with hashes and timestamps;
5. exports were logged;
6. AI outputs were not treated as professional advice;
7. compliance alerts were reminders, not legal guarantees;
8. JGA did not silently alter tenant financial records;
9. deletions, edits, imports, downloads, and approvals were logged;
10. every automated action had a source, policy, and ledger event.

---

## Audit Ledger Events

Ledger all major actions:

- record_created;
- record_updated;
- record_deleted_or_tombstoned;
- attachment_uploaded;
- attachment_downloaded;
- invoice_created;
- payment_recorded;
- refund_recorded;
- receipt_categorized;
- tax_category_changed;
- compliance_alert_created;
- compliance_alert_acknowledged;
- export_generated;
- accountant_package_generated;
- legal_package_generated;
- tenant_review_completed;
- owner_review_completed;
- AI_summary_generated;
- AI_output_quarantined;
- manual_override;
- emergency_freeze;
- record_retention_lock;
- subscription_restricted_mode.

---

## Tamper Protection

Records should use:

- append-only ledger entries;
- hash chaining;
- source file hashes;
- attachment checksums;
- actor identity;
- timestamped changes;
- tombstones instead of silent deletion;
- immutable export manifests;
- periodic audit snapshots;
- retention locks for regulated records.

A record may be corrected, but the correction must not erase the original history.

---

## Correction Policy

If a transaction is wrong:

```text
original record preserved → correction record created → reason recorded → actor logged → review status updated → ledger appended
```

Corrections must include:

- correction_id;
- original_record_id;
- reason;
- changed_fields;
- actor;
- timestamp;
- approval requirement;
- ledger hash.

---

## Deletion Policy

Silent deletion is prohibited for protected records.

Allowed deletion types:

- soft delete;
- tombstone;
- retention-expired purge with policy proof;
- owner-approved purge where legally allowed;
- tenant export-before-delete where required.

Deletion must log:

- who requested it;
- who approved it;
- why it was allowed;
- what retention rule applied;
- whether export was offered;
- final ledger hash.

---

## State-by-State Organization

Each state profile may require different retention, sales tax, payroll, licensing, filing, and reporting rules.

Every record must carry its state context.

A tenant operating in multiple states must keep records separated and searchable per state.

Example:

```text
Tenant A
  ├── Ohio
  │   ├── sales_tax
  │   ├── invoices
  │   └── compliance_alerts
  └── Michigan
      ├── sales_tax
      ├── invoices
      └── compliance_alerts
```

---

## Tax Memory Braid

Each Business Brick may have a Tax Memory Braid.

It organizes:

- gross sales;
- taxable sales;
- non-taxable sales;
- collected sales tax;
- refunds;
- expenses;
- receipt categories;
- contractor/payment support;
- payroll support;
- monthly summaries;
- quarterly summaries;
- annual tax-prep exports.

This braid prepares records for review, but it does not certify tax accuracy.

---

## Compliance Memory Braid

Each Business Brick may have a Compliance Memory Braid.

It organizes:

- licenses;
- permits;
- filings;
- deadlines;
- notices;
- state rule snapshots;
- local rule snapshots;
- compliance alerts;
- review notes;
- handoff packages;
- status reports.

This braid helps the tenant stay ready for review, but it does not replace legal/compliance professionals.

---

## System Audit Protecting JGA

The System Audit layer must maintain a JGA-side protection ledger showing:

- tenant agreed to responsibility notice;
- tenant selected or confirmed state profile;
- tenant received reminders/alerts;
- tenant had export access;
- tenant actions were logged;
- automation boundaries were disclosed;
- AI outputs were marked as non-professional guidance;
- professional review was recommended for tax/legal decisions;
- JGA did not file or certify without explicit authorized workflow;
- all support actions were logged.

---

## Required Tenant Notice

Every tenant dashboard and compliance/tax export should show:

```text
Your business is responsible for its own taxes, filings, licenses, legal compliance, and professional review. JGA Stitch provides recordkeeping, organization, reminders, exports, and audit trails. It does not replace a licensed accountant, attorney, payroll provider, tax professional, registered agent, insurance agent, or government agency.
```

---

## Reports

Each tenant should receive:

- daily transaction log if active;
- monthly recordkeeping summary;
- monthly compliance summary;
- quarterly tax-prep readiness report;
- annual export package;
- missing-document report;
- unmatched transaction report;
- suspicious change report;
- audit protection report;
- owner/admin review report.

JGA should receive platform-level reports with tenant privacy protected:

- tenant record health score;
- missing policy acknowledgments;
- export readiness status;
- compliance agent status;
- audit risk flags;
- subscription status;
- system integrity status.

---

## Easy Search Index

The system should index records by:

- tenant_id;
- brick_id;
- state;
- year;
- quarter;
- month;
- transaction_type;
- category;
- tax_category;
- client/vendor;
- amount range;
- payment status;
- review status;
- missing attachment;
- audit flag;
- retention date;
- ledger hash.

---

## Protection Against Bad Outcomes

If records are missing:

```text
flag gap → notify tenant → request upload → log unresolved status
```

If tenant ignores alerts:

```text
repeat reminder → mark acknowledged/unacknowledged → include in audit protection report
```

If AI gives questionable output:

```text
quarantine → mark non-advice → request human review
```

If compliance rule changes:

```text
state agent detects → classify impact → notify → create report → wait for tenant/pro review
```

If tenant disputes system action:

```text
produce audit trail → show timestamps → show actor → show policy → show record history
```

If legal/tax risk is high:

```text
escalate → restrict automation if needed → recommend qualified professional review
```

---

## Never-Fake Rule

The system must not claim records are complete unless completeness checks pass.

Use statuses:

- complete;
- incomplete;
- missing_attachment;
- needs_review;
- tenant_action_required;
- professional_review_required;
- export_ready;
- export_blocked.

---

## Final Operating Loop

```text
record → classify → hash → store → index → verify → report → remind → export → audit → protect
```

For every Business Brick, every state, every transaction, and every compliance/tax event, the Stitch must keep records easy to find, hard to tamper with, and clear about tenant responsibility.
