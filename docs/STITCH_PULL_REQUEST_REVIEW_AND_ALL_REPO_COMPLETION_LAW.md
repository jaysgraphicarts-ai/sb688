# Stitch Pull Request Review and All-Repo Completion Law

## Core Law

Pull request reviews, documentation updates, paper updates, page updates, and repo sync work must be completed whenever a change is made.

No change is complete until the affected PRs, docs, papers, pages, repos, platform sync tasks, and tie-off records are reviewed or marked not applicable with a reason.

## Scope

This applies to:

- all GitHub repositories;
- all open branches;
- all pull requests;
- all documentation files;
- all research papers and thesis drafts;
- all web pages and demos;
- all Supabase migrations and tables;
- all Docker runtime changes;
- all VS Code workspace and task changes;
- all Business Bricks and Work Room pages;
- all AI bridge and membrane changes.

## Required sequence

1. scan repositories;
2. list open branches;
3. list open pull requests;
4. review changed files;
5. check docs affected by the change;
6. check papers affected by the change;
7. check webpages and demos affected by the change;
8. update GitHub where needed;
9. update Docker status;
10. update VS Code status;
11. update Supabase status;
12. run or queue tests;
13. write review notes;
14. tie off or mark blocked.

## Pull request review rule

Every pull request must be reviewed for:

- Spine protection;
- membrane coverage;
- data quality;
- tenant isolation;
- bridge closed-by-default status;
- task queue updates;
- Supabase impact;
- Docker impact;
- VS Code impact;
- documentation impact;
- webpage impact;
- rollback path;
- test proof.

A PR may be approved only when evidence is sufficient.

If evidence is incomplete, the PR receives a comment or requested changes instead of a false approval.

## Docs and papers rule

When a system law, runtime module, page, database schema, bridge, Brick, or workflow changes, related docs and papers must be updated or marked not applicable.

## Page rule

Every relevant webpage or demo must be checked for stale language, missing workflow, missing safety boundary, or outdated architecture.

## All-repo rule

All accessible repos must be scanned or marked not reachable. The system must not claim all repos are updated unless each repo was checked and proof exists.

## Completion statuses

- complete_with_proof
- complete_docs_only
- runtime_test_needed
- pr_review_needed
- blocked_missing_access
- blocked_missing_sync
- not_applicable_with_reason
- designed_not_runtime_proven

## Final rule

Always complete the review chain. Never mark work done across all pages and repos without proof.
