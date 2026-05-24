# W42 DCC Runner / Suitelet Pattern Translation

Decision: COMPLETE / REQUIREMENTS TRANSLATED / NO NEW WRITES

## Objective

Review the proven Demo Command Center Runner and Suitelet mechanics and translate only the required write-path lessons into the Intelligent Demo Builder architecture.

## Blunt Findings

IDB has proven the first real write slice: Customer first, then Proof Item after Customer ID and URL exist. That is meaningful, but it is still thinner than the DCC path.

The DCC Runner did not just create records. It protected demo usability by resolving account context first, aligning vendor, controlling planning behavior, sequencing dependent writes, and separating transaction handoff from item setup. IDB must port those mechanics before expanding beyond Customer + Proof Item.

## DCC Mechanics That Must Move Forward

| DCC mechanic | Why it matters for IDB | Next block |
| --- | --- | --- |
| Account context first | Subsidiary and location must be known before list fields, item setup, and transaction context behave predictably. | W43 |
| Vendor attach | Proof Items need procurement credibility; vendor must be lookup-first and visible in evidence. | W44 |
| Planning control | DCC had to turn or seed planning behavior for stable demos. IDB needs this before trusting proof items. | W45 |
| Fresh vs anchor item mode | New item toggles must not create a separate brittle item path. | W46 |
| Runner sequencing | Parent records must finish before transaction context. | W48 |
| Transaction handoff | Sales Order work is separate and dependent; it should not be mixed into item creation. | W49 |
| Reset / refresh evidence | Consultants need record links, blocked dependents, and reset guidance without gate noise. | W47 |

## What Stays Blocked

- Main drawer automatic writes.
- Main Suitelet creation.
- Sales Order / transaction context writes.
- Silent vendor creation.
- Hidden planning field changes.
- N/LLM write authority.

## Architecture Decision

The next implementation sequence should be:

1. W43 Account Context Admin Resolver V2
2. W44 Vendor Attach And Procurement Defaults
3. W45 Planning Control Rail
4. W46 Proof Item Write V2
5. W47 Drawer Write Result UX V2
6. W50 Website Intelligence Release Candidate
7. W48 Transaction Context Readiness Pilot
8. W49 Sales Order Context Write Pilot
9. W51 Five-Consultant Test Pack
10. W52 Release Candidate And Completion Gate

This pulls website intelligence ahead of transaction writes because a Sales Order context is only valuable if the lane, package, and proof item are already right.

## No Regression

- Main package remains create-disabled.
- W24 pilot remains Customer + Proof Item only.
- Customer must complete before Proof Item.
- Transaction context remains disabled.
- Vendor attach is lookup-first and blocks on ambiguity.
- Planning behavior must be explicit in Review before it can be written.
- Every write result must return record ID, URL, operation, rollback label, and recoverable errors.

## Next

Move to W43: Account Context Admin Resolver V2. Add the missing account-level defaults that DCC required before broader item setup: currency, terms, class, department, and lane-specific default checks.
