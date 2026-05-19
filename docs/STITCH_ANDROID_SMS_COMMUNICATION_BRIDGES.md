# Stitch Android, SMS, and Communication Bridge Doctrine

## Core Law

All message bridges are closed by default.

No Android bridge, local modem, KDE Connect path, Signal relay, self-hosted SMS modem, Twilio adapter, email-to-SMS path, or carrier gateway may send, relay, publish, expose contacts, read private messages, or connect to the Spine without Owner's Room approval, membrane verification, consent checks, logging, and tie-off.

## Bridge Candidates

- Android bridge
- local modem
- KDE Connect
- Signal relay
- self-hosted SMS modem
- Twilio
- email-to-SMS
- carrier gateway

## Default Status

Every communication bridge begins as CLOSED.

Allowed statuses:

- CLOSED
- REVIEW_ONLY
- LOCAL_TEST
- OWNER_ENABLED
- QUARANTINED
- BLOCKED

## Shared Safety Rules

Every communication bridge must enforce:

- no Spine access
- no secret exposure
- no cross-tenant contact access
- no automatic sending without approval
- no unverified inbound content promotion
- no silent relay
- no bulk messaging without compliance review
- consent and opt-out tracking where applicable
- audit logging for every send and receive attempt
- emergency stop support

## Android Bridge

Purpose: local device-assisted message proposal and notification workflow.

Default: CLOSED.

Allowed when enabled:

- draft message
- receive local notification summary
- request owner review
- queue approved send task

Blocked:

- silent send
- reading all device data
- contact scraping
- bypassing approval
- background exfiltration

## Local Modem

Purpose: local hardware modem candidate for SMS or device communication.

Default: CLOSED.

Requires:

- local-only test
- modem identity record
- consent policy
- send approval queue
- delivery ledger
- emergency stop

## KDE Connect

Purpose: local Linux and Android bridge candidate for notifications and local device workflow.

Default: CLOSED.

Allowed when enabled:

- local notification relay
- local file proposal
- owner-reviewed message draft

Blocked:

- remote public access
- silent send
- unrestricted filesystem access

## Signal Relay

Purpose: future Signal-compatible relay candidate.

Default: CLOSED.

Requires:

- user consent
- endpoint verification
- no impersonation
- message approval queue
- compliance review for business use

## Self-Hosted SMS Modem

Purpose: owner-controlled SMS modem path.

Default: CLOSED.

Requires:

- SIM and modem inventory
- opt-in tracking
- send-rate controls
- audit ledger
- emergency stop
- carrier policy review

## Twilio

Purpose: commercial SMS, voice, and messaging provider candidate.

Default: CLOSED.

Requires:

- account setup outside the Spine
- secure environment variables
- webhook membrane
- consent and opt-out tracking
- compliance review
- send queue approval

## Email-to-SMS

Purpose: fallback bridge for sending to carrier SMS email gateways.

Default: CLOSED.

Risks:

- unreliable delivery
- carrier filtering
- privacy ambiguity
- format breakage

Requires Owner approval per send path.

## Carrier Gateway

Purpose: direct carrier gateway candidate.

Default: CLOSED.

Requires:

- carrier agreement
- compliance review
- opt-in policy
- message logging
- delivery tracking

## Outbound Message Flow

capture message idea -> classify -> check language -> check recipient consent -> scan content -> Owner approval -> queue -> send adapter -> delivery log -> tie off

## Inbound Message Flow

receive candidate message -> membrane scan -> source verification -> redact secrets -> classify -> queue -> Owner review -> learn_safe or quarantine

## Final Rule

Communication bridges are tools beside the Spine. They never become the Spine. All sending and relaying must be scoped, approved, logged, and recoverable.
