# Getting Started & Contributing

## Setup

**Requirements:**
- Node.js 14+
- npm or pnpm

**Install:**
```bash
git clone git@github-personal.com:sjlouji/project-fit.git
cd project-fit
npm install
npm run build
```

## Development

**Watch mode** — Automatically compiles when you change code:
```bash
npm run dev
```

**Run tests:**
```bash
npm test          # Run all tests
npm test:watch    # Rerun on changes
npm test:coverage # Show what's tested
```

**Check code style:**
```bash
npm run lint
```

## Code Organization

```
src/
├── models/           # Type definitions
├── algorithm/        # Packing logic
├── utils/            # Helper functions
└── __tests__/        # Test files
```

## Writing Tests

Tests use Jest. Here's a simple pattern:

```typescript
describe('Feature Name', () => {
  test('should do something', () => {
    // Setup
    const input = { ... };

    // Run
    const result = myFunction(input);

    // Check
    expect(result).toBe(expected);
  });
});
```

**Good practices:**
- Test normal cases
- Test edge cases (empty, zero, huge values)
- Test error cases
- Keep tests focused and short

## Code Style

- Keep code readable and simple
- Use clear variable names
- Comment the "why", not the "what"
- TypeScript types should be self-explanatory

## Making Changes

1. Create a test for what you want to fix/add
2. Make the code pass the test
3. Run all tests to make sure nothing broke: `npm test`
4. Commit with a clear message

## Committing

Write helpful commit messages:
```
Good: "Add rotation support for fragile items"
Bad: "Fix stuff"

Good: "Prevent stacking on load-bearing items"
Bad: "Update constraints"
```

## Before Publishing

```bash
npm test          # Make sure tests pass
npm run build     # Compile to dist/
npm publish       # Publish to npm
```

## Questions?

- See [How It Works](./ALGORITHMS.md) for algorithm details
- See [API Docs](./API.md) for all functions and types
