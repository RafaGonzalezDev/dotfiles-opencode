---
name: conventional-commit
description: Create commits following the Conventional Commits specification with short, clear English messages. Use this skill when the user asks to create a commit message, needs guidance on commit formatting, or wants to standardize commit messages across a project.
---

## Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Neither fix nor feature |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `chore` | Maintenance, dependencies |
| `build` | Build system changes |
| `ci` | CI configuration |
| `revert` | Revert a previous commit |

## Rules

**Subject** (mandatory): imperative mood, max 50 chars, lowercase after colon, no trailing period.
**Scope** (optional): area of the codebase in parentheses — `auth`, `api`, `ui`, `db`, `config`, etc.
**Body** (optional): what and why, not how. Wrap at 72 chars.
**Footer** (optional): breaking changes and issue references.

Breaking change: `BREAKING CHANGE: <description>`
Issue reference: `Closes #123` or `Refs #456`

## Examples
```
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth2 via Passport.js.

Closes #142
```
```
fix(api): handle null user responses

Return 404 instead of 500 when user object is null
during authentication failures.
```
```
refactor(utils): extract date formatting functions

BREAKING CHANGE: utils.formatDate() moved to date.formatDate()
```
```
fix: correct email validation regex

Closes #89
```