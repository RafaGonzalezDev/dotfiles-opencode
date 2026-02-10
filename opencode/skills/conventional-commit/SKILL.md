---
name: conventional-commit
description: Create commits following the Conventional Commits specification with short, clear English messages. Use this skill when the user asks to create a commit message, needs guidance on commit formatting, or wants to standardize commit messages across a project.
---

This skill guides creation of commits following the Conventional Commits specification, which provides a standardized format for commit messages that makes it easier to understand what changes were introduced in each commit and to automate version control workflows.

The user requests commit message creation or guidance on formatting git commits. They may provide context about the changes made, the type of modification, or specific requirements for the commit message.

## Conventional Commits Structure

Every commit message must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Required Elements

- **type**: The type of change (mandatory)
- **subject**: A short description (mandatory, max 50 characters, use imperative mood, no period at end)
- **body**: Detailed explanation (optional, wrap at 72 characters per line)
- **footer**: Breaking changes or related issue references (optional)

## Commit Types

Use these commit types:

- **feat**: A new feature (adds functionality)
- **fix**: A bug fix (corrects existing behavior)
- **docs**: Documentation changes only
- **style**: Code style changes (formatting, missing semicolons, no logic change)
- **refactor**: Code refactoring (neither fixes bug nor adds feature)
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (build process, dependencies, configuration)
- **build**: Changes to build system or external dependencies
- **ci**: Changes to CI configuration files
- **revert**: Reverts a previous commit

## Scope

The scope is optional and provides additional context about the area of the codebase affected by the change. Use parentheses after the type:

```
feat(auth): add OAuth2 login support
fix(api): correct user authentication error
docs(readme): update installation instructions
```

Common scopes include: auth, api, ui, db, config, utils, middleware, etc.

## Subject Guidelines

- Use imperative mood ("add" not "added", "fix" not "fixed")
- Keep it under 50 characters
- Don't end with a period
- Be concise but descriptive
- Start with a lowercase letter (after type:)

## Body Guidelines

- Use imperative mood
- Explain what and why, not how
- Wrap lines at 72 characters
- Reference related issues or PRs if applicable

## Footer Guidelines

- Use for breaking changes: "BREAKING CHANGE: <description>"
- Reference issues: "Closes #123" or "Refs #456"
- One line per issue reference

## Examples

```
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth2 authentication
using Passport.js. Users can now sign in with their
existing social media accounts.

Closes #142

feat(ui): add dark mode toggle

Add a toggle button in the header that allows users
to switch between light and dark themes. The preference
is persisted in localStorage.

fix(api): handle null user responses

The API now properly handles cases where the user object
is null by returning a 404 status instead of 500.

This was causing server errors during authentication failures.

fix: correct email validation regex

The previous regex incorrectly rejected valid email addresses
with plus signs in the local part.

Closes #89

docs(readme): update installation instructions

Clarify the Node.js version requirement and add
troubleshooting section for common installation issues.

refactor(utils): extract date formatting functions

Move date formatting utilities from utils.js to
a new date.js module for better code organization.

BREAKING CHANGE: utils.formatDate() has been moved to date.formatDate()
```

## Best Practices

- Keep commits small and focused (one logical change per commit)
- Write messages that make sense without looking at the code
- Use the present tense ("add feature" not "added feature")
- Be specific about what changed and why
- Reference issues or PRs when appropriate
- Mark breaking changes clearly in the footer

Remember: Conventional commits enable automated changelogs, semantic versioning, and easier code reviews. Consistency and clarity are key to maintaining a clean commit history.
