---
name: solid-review
description: Reference guide for identifying and correcting SOLID and DRY violations during code review or implementation. Use when reviewing code for architectural quality, naming a specific violation, or deciding how to refactor a class or module.
---

## Examples:
- user: "this class does too many things" → identify SRP violation
- user: "review this module for SOLID compliance" → apply full checklist
- user: "there is duplicated logic across these two services" → identify DRY violation

## SOLID principles

### S — Single Responsibility Principle
A class or module should have one reason to change.

Violation signals: a class name containing "And", "Manager", "Handler", or "Helper"
with unrelated methods; methods that mix business logic with persistence or
presentation; a class that changes for more than one type of requirement.

Correction: extract each responsibility into its own class or module.

### O — Open/Closed Principle
A class should be open for extension, closed for modification.

Violation signals: switch/if-else chains that grow when new types are added;
core logic that must be edited to support new behavior; conditionals branching
on type strings or enums throughout the codebase.

Correction: introduce polymorphism, strategy pattern, or a plugin/registry approach
so new behavior is added by extension, not modification.

### L — Liskov Substitution Principle
A subclass must be substitutable for its base class without breaking behavior.

Violation signals: a subclass that throws `NotImplementedException` or overrides
a method with an empty body; preconditions strengthened in a subclass;
postconditions weakened; a subclass that ignores or rejects input the base class accepts.

Correction: redesign the hierarchy so subclasses only extend, never restrict.
Prefer composition over inheritance when substitutability cannot be guaranteed.

### I — Interface Segregation Principle
Clients should not depend on interfaces they do not use.

Violation signals: an interface with more than 5–7 methods; classes that implement
an interface but leave several methods empty or throwing; callers that only use
one or two methods of a large interface.

Correction: split the interface into focused, role-specific contracts.

### D — Dependency Inversion Principle
High-level modules should not depend on low-level modules. Both should depend
on abstractions.

Violation signals: a business class that instantiates infrastructure directly
(`new EmailService()`, `new PostgresRepository()`); hard-coded dependencies
that make unit testing impossible without mocking internals; logic that imports
from concrete implementations rather than interfaces or ports.

Correction: inject dependencies through the constructor or a DI container.
Define interfaces at the boundary between layers.

## DRY — Don't Repeat Yourself

Violation signals: identical or near-identical blocks of logic in two or more
places; copy-pasted code with minor variations; constants or configuration
values duplicated across files; the same transformation or validation applied
in multiple layers without a shared utility.

Correction: extract the shared logic into a named function, class, or module.
If the duplication is across layers, evaluate whether it represents genuinely
different concerns before merging.

## Review checklist

- Does each class have exactly one reason to change?
- Can new behavior be added without modifying existing classes?
- Are all subclasses fully substitutable for their base?
- Are interfaces focused and minimal?
- Are dependencies injected, not instantiated internally?
- Is every piece of knowledge expressed exactly once?

## Output format when reporting violations

- Principle violated (full name + letter).
- File path and line reference.
- Concrete explanation of why it is a violation.
- Suggested correction specific to the context.