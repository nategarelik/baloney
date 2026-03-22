---
name: baloney-conventions
description: Development conventions and patterns for baloney. TypeScript project with conventional commits.
---

# Baloney Conventions

> Generated from [nategarelik/baloney](https://github.com/nategarelik/baloney) on 2026-03-22

## Overview

This skill teaches Claude the development patterns and conventions used in baloney.

## Tech Stack

- **Primary Language**: TypeScript
- **Architecture**: type-based module organization
- **Test Location**: mixed
- **Test Framework**: vitest

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 117 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `fix`
- `docs`
- `chore`
- `test`

### Message Guidelines

- Average message length: ~61 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
docs: add baloney-platform cross-references
```

*Commit message example*

```text
test: add video detection accuracy tests with frame-level analysis
```

*Commit message example*

```text
chore: add @vercel/og dependency for dynamic OG image generation
```

*Commit message example*

```text
feat: add shareable scan results with dynamic OG images
```

*Commit message example*

```text
fix: sync extension config with detection-config.ts (resolve TODOs)
```

*Commit message example*

```text
docs: add proprietary detection model and C2PA provenance research
```

*Commit message example*

```text
test: add image detection accuracy tests with real pipeline integration
```

*Commit message example*

```text
test: add 2026-generation benchmark dataset (329 samples, 122 new)
```

## Architecture

### Project Structure: Single Package

This project uses **type-based** module organization.

### Configuration Files

- `backend/Dockerfile`
- `frontend/next.config.js`
- `frontend/package.json`
- `frontend/scripts/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/tsconfig.json`
- `frontend/vitest.config.ts`

### Guidelines

- Group code by type (components, services, utils)
- Keep related functionality in the same type folder
- Avoid circular dependencies between type folders

## Code Style

### Language: TypeScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Relative Imports

### Export Style: Named Exports


*Preferred import style*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
```

*Preferred export style*

```typescript
// Use named exports
export function calculateTotal() { ... }
export const TAX_RATE = 0.1
export interface Order { ... }
```

## Testing

### Test Framework: vitest

### File Pattern: `*.test.ts`

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between multiple components/services


*Test file structure*

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Error Handling

### Error Handling Style: Try-Catch Blocks


*Standard error handling pattern*

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly message')
}
```

## Common Workflows

These workflows were detected from analyzing commit patterns.

### Feature Development

Standard feature implementation workflow

**Frequency**: ~17 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `frontend/src/app/api/detect/video/*`
- `frontend/src/lib/*`
- `frontend/src/app/api/analytics/community/flow/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
fix: SightEngine MIME type bug + error logging + video parsing
fix: add railway.toml + fix tensor detach warning for Railway deployment
fix: use ensurepip in nixpacks.toml to fix pip not found build error
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~3 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
refactor: remove secondary/backup detection, keep primary APIs only (v5.0)
fix: remove all fake/mock detection paths, use real API only
fix: SightEngine MIME type bug + error logging + video parsing
```

### Add Or Update Dashboard Visualization

Adds a new dashboard chart or visualization, often with supporting API endpoints and type updates.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update dashboard component in frontend/src/app/dashboard/*.tsx
2. Add or update supporting API route in frontend/src/app/api/analytics/community/*/route.ts or similar
3. Update types/interfaces in frontend/src/lib/types.ts
4. Wire new visualization into dashboard page (frontend/src/app/dashboard/page.tsx or community/page.tsx)

**Files typically involved**:
- `frontend/src/app/dashboard/*.tsx`
- `frontend/src/app/api/analytics/community/*/route.ts`
- `frontend/src/lib/types.ts`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/dashboard/community/page.tsx`

**Example commit sequence**:
```
Create or update dashboard component in frontend/src/app/dashboard/*.tsx
Add or update supporting API route in frontend/src/app/api/analytics/community/*/route.ts or similar
Update types/interfaces in frontend/src/lib/types.ts
Wire new visualization into dashboard page (frontend/src/app/dashboard/page.tsx or community/page.tsx)
```

### Add Or Update Detection Tests And Benchmarks

Adds new test suites or benchmark datasets for detection accuracy, often with integration to the detection pipeline.

**Frequency**: ~2 times per month

**Steps**:
1. Add new test file in frontend/src/__tests__/*.test.ts
2. Add or update benchmark dataset in frontend/src/__tests__/*.ts
3. Update detection config or logic in frontend/src/lib/detection-config.ts or real-detectors.ts
4. Run and validate tests

**Files typically involved**:
- `frontend/src/__tests__/*.test.ts`
- `frontend/src/__tests__/*.ts`
- `frontend/src/lib/detection-config.ts`
- `frontend/src/lib/real-detectors.ts`

**Example commit sequence**:
```
Add new test file in frontend/src/__tests__/*.test.ts
Add or update benchmark dataset in frontend/src/__tests__/*.ts
Update detection config or logic in frontend/src/lib/detection-config.ts or real-detectors.ts
Run and validate tests
```

### Add Or Update Documentation

Adds or updates documentation files, including platform docs, research notes, and workflow guides.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update markdown files in docs/ or root (e.g., CLAUDE.md, COMPANY.md)
2. Update documentation index or cross-references
3. Optionally update .gitignore to whitelist or hide docs

**Files typically involved**:
- `docs/*.md`
- `CLAUDE.md`
- `README.md`
- `.gitignore`

**Example commit sequence**:
```
Create or update markdown files in docs/ or root (e.g., CLAUDE.md, COMPANY.md)
Update documentation index or cross-references
Optionally update .gitignore to whitelist or hide docs
```

### Refactor Or Modularize Detection Pipeline

Refactors detection logic by extracting, modularizing, or centralizing detection configuration and logic.

**Frequency**: ~1 times per month

**Steps**:
1. Extract or centralize config into frontend/src/lib/detection-config.ts
2. Split monolithic detection files into focused modules under frontend/src/lib/detectors/
3. Update imports and ensure all tests pass
4. Update types if needed

**Files typically involved**:
- `frontend/src/lib/detection-config.ts`
- `frontend/src/lib/real-detectors.ts`
- `frontend/src/lib/detectors/*.ts`
- `frontend/src/lib/types.ts`
- `frontend/src/__tests__/*.test.ts`

**Example commit sequence**:
```
Extract or centralize config into frontend/src/lib/detection-config.ts
Split monolithic detection files into focused modules under frontend/src/lib/detectors/
Update imports and ensure all tests pass
Update types if needed
```

### Add Or Update Extension Features Or Config

Adds or updates browser extension features, configuration, or content/sidepanel scripts.

**Frequency**: ~2 times per month

**Steps**:
1. Update extension/content.js, extension/sidepanel.js/html, or extension/manifest.json
2. Sync config with frontend/src/lib/detection-config.ts if needed
3. Update extension/background.js for event handling
4. Test extension in browser

**Files typically involved**:
- `extension/content.js`
- `extension/sidepanel.js`
- `extension/sidepanel.html`
- `extension/manifest.json`
- `extension/background.js`
- `frontend/src/lib/detection-config.ts`

**Example commit sequence**:
```
Update extension/content.js, extension/sidepanel.js/html, or extension/manifest.json
Sync config with frontend/src/lib/detection-config.ts if needed
Update extension/background.js for event handling
Test extension in browser
```

### Add Or Update Api Endpoint

Adds a new API route or updates an existing one, often for analytics, detection, or dashboard features.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update route in frontend/src/app/api/*/route.ts
2. Update types/interfaces in frontend/src/lib/types.ts if needed
3. Update frontend components to consume new API
4. Write or update tests if applicable

**Files typically involved**:
- `frontend/src/app/api/*/route.ts`
- `frontend/src/lib/types.ts`
- `frontend/src/app/dashboard/*.tsx`
- `frontend/src/app/analyze/*.tsx`

**Example commit sequence**:
```
Create or update route in frontend/src/app/api/*/route.ts
Update types/interfaces in frontend/src/lib/types.ts if needed
Update frontend components to consume new API
Write or update tests if applicable
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Write tests using vitest
- Follow *.test.ts naming pattern
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
