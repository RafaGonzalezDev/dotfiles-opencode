---
name: github-pull-request
description: Create and manage GitHub Pull Requests via the GitHub CLI (`gh`). Use this skill whenever the user asks to open, draft, or submit a pull request, needs guidance on PR structure, wants to set reviewers/labels/assignees, or asks how to create a PR from the terminal or command line.
---

## Prerequisites

GitHub CLI installed and authenticated:

```bash
gh auth status        # verify authentication
gh auth login         # authenticate if needed
```

## PR Title

Follow the same Conventional Commits format used for commit messages:

```
<type>(<scope>): <subject>
```

- Imperative mood, lowercase after the colon, no trailing period.
- Max 72 characters.
- Must clearly describe what the PR does, not how.

## Base Command

```bash
gh pr create \
  --title "<type>(<scope>): <subject>" \
  --body "<description>" \
  --base <target-branch>
```

If `--base` is omitted, `gh` uses the repository's default branch.

## PR Body Structure

```
## What

<What does this PR do? One or two sentences.>

## Why

<Why is this change needed? Link to issue or provide context.>

## How

<Optional. Only include if the approach is non-obvious or worth documenting.>

## Notes

<Optional. Breaking changes, caveats, follow-up tasks, screenshots.>

Closes #<issue-number>
```

Use `--body-file pr-body.md` for longer descriptions instead of inline `--body`.

## Common Flags

| Flag | Purpose |
|---|---|
| `--draft` | Open as draft (not ready for review) |
| `--reviewer <user>` | Request review from a user or team |
| `--assignee <user>` | Assign the PR |
| `--label <label>` | Add a label |
| `--milestone <name>` | Attach to a milestone |
| `--fill` | Auto-fill title and body from commits |
| `--web` | Open the resulting PR in the browser |

Multiple values: repeat the flag (`--reviewer alice --reviewer bob`).

## Rules

- Always push the branch before creating the PR: `git push -u origin <branch>`.
- Use `--draft` when the work is incomplete or feedback is wanted before review.
- Scope in the title must match the conventional-commit scope used in the branch commits.
- `Closes #<n>` in the body automatically closes the linked issue on merge.
- Never use `--fill` for PRs that touch multiple scopes or have a non-trivial description — write the body explicitly.

## Examples

### Simple feature PR

```bash
gh pr create \
  --title "feat(auth): add OAuth2 login support" \
  --body "## What
Adds Google and GitHub OAuth2 login via Passport.js.

## Why
Users requested social login in #142.

Closes #142" \
  --base main \
  --reviewer alice
```

### Draft PR with label

```bash
gh pr create \
  --title "fix(api): handle null user responses" \
  --body "## What
Returns 404 instead of 500 when the user object is null during auth.

## Why
Tracked in #89 — currently causes unhandled 500 errors in production." \
  --base main \
  --draft \
  --label bug
```

### PR from body file

```bash
gh pr create \
  --title "refactor(utils): extract date formatting functions" \
  --body-file pr-body.md \
  --base develop \
  --reviewer alice \
  --reviewer bob \
  --label refactor
```

## Useful Follow-up Commands

```bash
gh pr list                        # list open PRs in the repo
gh pr status                      # PRs involving you
gh pr view                        # view current branch's PR
gh pr view --web                  # open PR in browser
gh pr edit --add-reviewer <user>  # add reviewer after creation
gh pr ready                       # convert draft to ready for review
gh pr merge --squash --delete-branch   # merge and clean up branch
```
