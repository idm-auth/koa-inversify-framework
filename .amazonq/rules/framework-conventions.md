# CRITICAL: Read These Rules

- ALWAYS read this ENTIRE rules file before making ANY changes to the framework codebase
- Reading these rules will prevent 90% of errors and avoid wasting time with wrong assumptions
- When in doubt about how something works (decorators, patterns, conventions), READ THE CODE first, then check these rules
- Do NOT make assumptions - verify against rules and actual implementation

## MANDATORY: fsRead BEFORE ANY FILE MODIFICATION

**THIS RULE IS ABSOLUTE. NO EXCEPTIONS. NO SHORTCUTS.**

**COST OF SPEED: Every shortcut costs 10x more tokens in rework. Slow is fast.**

Before modifying ANY existing file:
1. Call `fsRead` on the file
2. PLAN what you will change (tell user first)
3. Wait for user confirmation or proceed if clear
4. Make the modification

If you have not read the file in THIS conversation, you CANNOT modify it.
If you are unsure what is in the file, STOP and read it first.

**REQUIRED FORMAT for any file modification:**
```
Reading [filename]...
[fsRead]
I will change [X] to [Y] because [reason].
OK to proceed?
```

Then after confirmation: make the change.

**If you skip fsRead or make changes without planning:**
- The modification will be wrong
- Tokens will be wasted on rework
- User time will be wasted

**Violations of this rule:**
- Removing code that should stay
- Adding code that wasn't there
- Changing behavior unexpectedly
- Breaking existing functionality
- Acting fast instead of correct

**THIS APPLIES TO THIS RULES FILE TOO:**
- Before modifying this rules file: fsRead first
- Plan the change
- Get confirmation
- Then modify
- No exceptions, even for rules

---

- **NEVER invent or assume API signatures - ALWAYS read the actual code to understand:**
  - Method parameters and return types
  - Constructor dependencies and injection patterns
  - Decorator usage and options
  - Class inheritance and abstract method implementations
- **Before writing code that uses a class/function/decorator:**
  1. Use `fsRead` to read the source file
  2. Understand the actual implementation
  3. Follow the exact patterns used in existing code
  4. Do NOT guess or make assumptions based on naming alone

# Framework Conventions

## AI Behavior - CRITICAL OVERRIDE

- **ALWAYS ask for clarification before making ANY code changes when there is ANY ambiguity**
- **NEVER assume what the user wants - confirm first, then act**
- **Economy comes from doing it right the first time, not from acting fast**
- **If there's ANY doubt about:**
  - Which file to modify (even if file names are similar)
  - Where to place the code (inside a function, in a new file, etc.)
  - What the user means by their instruction
  - Whether to create new code or modify existing code
  - **STOP and ASK - do not proceed with assumptions**
- **Wasting tokens on clarification (50 tokens) is MUCH better than wasting tokens on rework (500+ tokens)**
- **User frustration from wrong assumptions is worse than any token cost**

## Project Phase: Foundation/Construction

### Current State
- Project is NOT in production - it's being built from scratch
- Breaking changes are EXPECTED and ENCOURAGED when they improve architecture
- Refactoring is part of the process - embrace it
- When finding architectural flaws, FIX them completely, don't work around them

### Decision Making Principles
- ALWAYS prioritize correctness over backward compatibility
- ALWAYS suggest the architecturally correct solution, even if it requires refactoring
- NEVER be defensive about breaking changes - the project is small and designed for this
- NEVER suggest optional parameters just to avoid breaking existing code
- When you see a design flaw, point it out immediately and suggest the proper fix

### Refactoring Approach
- When refactoring is needed, do it completely - don't leave half-fixed code
- Update ALL affected files in the same change
- Remove old patterns completely, don't support both old and new
- The codebase is small enough to refactor everything at once

### Key Questions to Ask
- "Is this the architecturally correct solution?" (not "will this break existing code?")
- "Does this follow best practices?" (not "is this compatible?")
- "Will this scale properly?" (not "is this the easiest change?")
- "Is this the right design for the long term?" (not "is this the quickest fix?")

## Documentation
- Usage guide: `.doc/usage-guide.md` - Complete example of building a DDD module
- Reference implementations:
  - Main application: `src/domain/realm/account/` module
  - Framework test: `test/domain/sample/` module (for framework development)

## Architecture
- Framework provides base abstractions for building DDD applications with Koa + Inversify
- Located at `.external/koa-inversify-framework/` (developed locally, not npm package)
- Used by main application via imports: `import { AbstractService } from 'koa-inversify-framework/abstract'`

## Directory Structure
- `src/abstract/` - Base classes (Controller, Service, Repository, Mapper, Module)
- `src/stereotype/` - DI decorators (@Controller, @Service, @Repository, @Mapper, @Configuration)
- `src/infrastructure/` - Technical providers (Koa, MongoDB, Logger, Telemetry, Swagger, Env, Context)
- `src/common/` - Shared DTOs, schemas, types

## Naming Rules
- ALWAYS use singular form: `infrastructure/`, `abstract/`, `stereotype/`
- DI symbols: PascalCase with `Symbol` suffix: `KoaServerSymbol`, `MongoDBSymbol`
- Provider files: `[name].provider.ts` format
- Decorator files: `[name].decorator.ts` format
- Stereotype files: `[name].stereotype.ts` format

## File Organization Rules
- NEVER create separate `.type.ts` files - types in same file as implementation
- ALWAYS export DI symbols in same file as their class
- Each provider/decorator/stereotype in its own file

## Import Rules
- ALWAYS use `@/` alias for internal imports: `import { KoaServer } from '@/infrastructure/koa/koaServer.provider'`
- NEVER use relative paths like `../../`

## Provider Pattern
- Infrastructure providers implement init/shutdown lifecycle
- Providers are bound to container in Framework.init()
- Providers use DI: `@inject(Symbol)` in constructors
- ALWAYS import exported symbols - NEVER recreate with `Symbol.for('string')`

## Decorator Pattern
- Stereotypes: @Controller, @Service, @Repository, @Mapper, @Configuration
- Route decorators: @Get, @Post, @Put, @Patch, @Delete
- Utility decorators: @TraceAsync for telemetry

## Abstract Classes Pattern
- AbstractController - CRUD operations, validation, error handling
- AbstractService - Business logic orchestration
- AbstractRepository - Data access layer
- AbstractMapper - Entity ↔ DTO transformation
- AbstractModule - DI container binding

## Error Handling Pattern - Fail Fast Philosophy

**Core Principle: Fail Fast, Not Silent**
- Errors should surface immediately at the point of failure, not be hidden with null checks
- Repository layer throws exceptions when data is not found - this makes problems visible immediately
- Returning `null` pushes error handling responsibility up the stack and creates ambiguity
- Exception-based flow makes the "unhappy path" explicit and forces proper handling

**Repository Layer Rules:**
- Repository methods THROW exceptions when data is not found (NotFoundError)
- NEVER return `null` or `undefined` from repository methods - this hides failures
- Return types are `Promise<Entity>`, NOT `Promise<Entity | null>`
- If a method CAN fail to find data, it MUST throw an exception, not return null
- This forces Service/Controller layers to explicitly handle the "not found" case

**Why This Matters:**
- `null` is ambiguous: Was there an error? Is null a valid value? Did we forget to check?
- Exceptions are explicit: Something went wrong, and you MUST handle it
- TypeScript can't force null checks, but it can force try/catch or let exceptions bubble
- Fail fast = easier debugging, clearer error messages, no silent failures

**Implementation Pattern:**
```typescript
// ✅ CORRECT - throws NotFoundError immediately if not found
async findByEmail(email: string): Promise<Entity> {
  return this.findOne({ email }); // throws NotFoundError if not found
}

// ❌ WRONG - hides failure with null, forces null checks everywhere
async findByEmail(email: string): Promise<Entity | null> {
  const result = await this.findOne({ email });
  return result ?? null; // Silent failure - caller might forget to check
}

// Service layer handles the exception explicitly
async someBusinessLogic(email: string) {
  try {
    const user = await this.repository.findByEmail(email);
    // user is guaranteed to exist here
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Explicit handling of "not found" case
    }
    throw error;
  }
}
```

**When to Use Null:**
- Optional fields in DTOs/entities: `{ name?: string }` - null is a valid business value
- Query parameters: `{ filter?: string }` - absence of input is valid
- NEVER as a return type to indicate "not found" - use exceptions instead

## TypeScript Rules
- NEVER use `any` type
- NEVER use type casting (`as`) - prefer type intersection on parameters
- ALWAYS provide proper type annotations and generics
- Type safety is non-negotiable

## Koa Context Typing
- NEVER cast `ctx.params`, `ctx.state`, or `ctx.request.body`
- ALWAYS extend Context inline with intersection types:
  ```typescript
  async (ctx: Context & { params: { id: string } }, next: Next) => {
    const id = ctx.params.id; // Type-safe!
  }
  ```
- Use optional properties when parameter may not exist:
  ```typescript
  ctx: Context & { params: { tenantId?: string } }
  ```

## Code Style Rules
- Write MINIMAL code - only what's necessary
- NO verbose comments - code must be self-documenting
- ONE responsibility per file/class
- NEVER remove documentation comments (JSDoc, block comments explaining usage, architecture, or initialization flows)
- Documentation comments are NOT verbose comments - they provide essential context for developers

## MongoDB Schema Rules
- NEVER create explicit index on `_id` field - MongoDB creates it automatically
- ALWAYS prefer field-level indexes (`index: true`) over schema-level indexes when possible
- Use schema-level indexes (`schema.index()`) ONLY when you need:
  - Compound indexes: `schema.index({ field1: 1, field2: 1 })`
  - Index options: `{ unique: true, sparse: true, name: 'custom_name' }`
- Use `sparse: true` for indexes on array fields to allow multiple documents with empty arrays
- Index naming: let MongoDB auto-generate names (field-level: `fieldName_1`, compound: `field1_1_field2_1`)

## File Management Rules
- When moving content to a new file, ALWAYS delete the old file if it's no longer used
- Keep the codebase clean - no orphaned or unused files
- After refactoring, verify and remove obsolete files

## Problem Solving Rules
- NEVER remove functionality when encountering errors - ALWAYS investigate and fix properly
- When something doesn't work, research the correct solution (check documentation, examples, types)
- Removing features is NOT a solution - it's avoiding the problem
- If unsure about the correct approach, ask for clarification before implementing
- ALWAYS present the solution plan BEFORE implementing, especially when creating new files or making architectural changes
- Wait for user confirmation before proceeding with file creation or major refactoring
- ALWAYS check existing implementations before assuming behavior - verify types and error handling patterns

## Honesty About Unsolved Problems - MANDATORY

**NEVER pretend a problem is solved when it isn't. NEVER remove code and claim it's "resolved".**

- If you don't know how to fix something, SAY SO explicitly
- NEVER use phrases like "it's resolved" or "done" when you've just removed the problematic code
- Removing a feature is NOT fixing a problem - it's avoiding it
- If stuck, explain:
  - What you tried
  - Why it didn't work
  - What you think the real issue is
  - What you need to proceed
- Honesty about limitations is better than false confidence
- Better to say "I don't know" than to pretend and waste time

## Test Execution Rules
- When running a SINGLE test file, NEVER use grep, tail, head or any output filter
- Single test output is small (~3000-4000 tokens) compared to 200K token budget
- Using filters wastes MORE tokens by requiring multiple executions to read logs
- Run the test command directly: `npm test path/to/test.ts` without any pipes
- Only use filters when running ALL tests or very large outputs (50K+ tokens)
