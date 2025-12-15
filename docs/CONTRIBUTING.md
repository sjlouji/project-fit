# Contributing & Development Guide

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm or pnpm package manager

### Setup

```bash
# Clone the repository
git clone git@github-personal.com:sjlouji/project-fit.git
cd project-fit

# Install dependencies
npm install

# Build the project
npm run build
```

## Development Workflow

### Watch Mode

During development, use watch mode to automatically compile TypeScript as you make changes:

```bash
npm run dev
```

### Running Tests

Tests are written with Jest and cover unit tests, integration tests, and edge cases.

```bash
# Run all tests
npm test

# Watch mode (rerun tests on file changes)
npm test:watch

# Generate coverage report
npm test:coverage
```

### Code Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── models/
│   ├── container.ts      # Container interface
│   ├── item.ts          # Item interface
│   └── result.ts        # Packing result interface
├── algorithm/
│   ├── packer.ts        # Main BinPacker class
│   ├── extremePoint.ts  # Extreme Point algorithm
│   └── constraints.ts   # Constraint validation logic
├── utils/
│   ├── geometry.ts      # 3D geometry utilities
│   └── rotations.ts     # Item rotation calculations
├── index.ts             # Main export file
└── __tests__/           # Test files
    ├── weight-constraints.test.ts
    ├── rotation-handling.test.ts
    ├── stability.test.ts
    ├── edge-cases.test.ts
    └── delivery-order.test.ts
```

## Code Standards

- **Language**: TypeScript 5.x
- **Format**: ESLint configuration provided
- **Tests**: Every new feature requires tests
- **Comments**: Self-documenting code preferred; comments explain "why", not "what"
- **No AI artifacts**: Keep code human-written and maintainable

## Testing Guidelines

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test algorithm end-to-end with realistic scenarios
- **Edge Cases**: Test boundary conditions, empty inputs, extreme values
- **Real-World Examples**: Include scenario-based tests

Example test structure:

```typescript
describe('Feature Name', () => {
  test('should handle nominal case', () => {
    // Arrange
    const input = /* ... */;

    // Act
    const result = /* ... */;

    // Assert
    expect(result).toBe(/* ... */);
  });

  test('should handle edge case', () => {
    // Test boundary conditions
  });
});
```

## Committing Changes

Commit messages should be clear and descriptive:

- Use imperative mood: "Add feature" not "Added feature"
- Include context: "Add LIFO validation for multi-stop delivery" rather than "Fix bug"
- Keep commits focused on single changes

## Building for Distribution

```bash
npm run clean    # Remove old build
npm run build    # Compile TypeScript
npm test         # Verify tests pass
```

The `dist/` folder contains the compiled JavaScript and TypeScript declarations for distribution.

## Publishing to npm

```bash
# Ensure tests pass and build succeeds
npm test
npm run build

# Publish (requires npm authentication)
npm publish
```

## Questions?

Refer to the [API Reference](./API.md) for detailed documentation or [Algorithms](./ALGORITHMS.md) for technical deep dives.
