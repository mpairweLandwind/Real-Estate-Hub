# Testing Guide

This document describes the testing setup and best practices for the Real Estate Management System.

## Testing Stack

- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions

## Project Structure

```
__tests__/
├── components/          # Component tests
│   ├── button.test.tsx
│   ├── card.test.tsx
│   └── input.test.tsx
├── integration/         # Integration tests
│   └── property-card.test.tsx
├── lib/                 # Utility/library tests
│   ├── utils.test.ts
│   └── validations.test.ts
└── test-utils.tsx       # Shared test utilities
```

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (for development)
yarn test:watch

# Run tests with coverage report
yarn test:coverage

# Run tests in CI mode (for CI/CD pipeline)
yarn test:ci
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '../test-utils';
import { Button } from '@/components/ui/button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('triggers onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Validation Tests

```typescript
import { propertySchema } from '@/lib/validations';

describe('propertySchema', () => {
  it('validates correct property data', () => {
    const result = propertySchema.safeParse({
      title: 'Beautiful Apartment',
      propertyType: 'apartment',
      // ... other fields
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid data', () => {
    const result = propertySchema.safeParse({
      title: 'Apt', // Too short
      propertyType: 'apartment',
    });
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests

```typescript
import { render, screen, waitFor } from '../test-utils';

describe('Feature Integration', () => {
  it('completes user flow', async () => {
    const user = userEvent.setup();
    
    render(<YourComponent />);
    
    // Simulate user interactions
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert expected outcomes
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### 1. Use Semantic Queries

Prefer queries that reflect how users interact with your app:

```typescript
// ✅ Good - accessible and user-centric
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/welcome/i)

// ❌ Avoid - implementation details
screen.getByTestId('submit-button')
screen.getByClassName('btn-primary')
```

### 2. Test User Behavior, Not Implementation

```typescript
// ✅ Good - tests what user sees
it('displays error message when form is invalid', async () => {
  render(<Form />);
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/required/i)).toBeInTheDocument();
});

// ❌ Avoid - tests internal state
it('sets error state to true', () => {
  const { result } = renderHook(() => useForm());
  result.current.setError(true);
  expect(result.current.error).toBe(true);
});
```

### 3. Use userEvent Over fireEvent

```typescript
// ✅ Good - simulates real user interactions
const user = userEvent.setup();
await user.type(input, 'Hello');
await user.click(button);

// ❌ Avoid - lower-level, less realistic
fireEvent.change(input, { target: { value: 'Hello' } });
fireEvent.click(button);
```

### 4. Wait for Async Updates

```typescript
// ✅ Good - waits for async updates
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});

// ✅ Also good - finds element when it appears
const element = await screen.findByText(/loaded/i);

// ❌ Avoid - doesn't wait for async updates
expect(screen.getByText(/loaded/i)).toBeInTheDocument();
```

### 5. Mock External Dependencies

```typescript
// Mock API calls
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));

// Mock components that are complex or not relevant
jest.mock('@/components/map-picker', () => ({
  MapPicker: () => <div data-testid="map-picker">Map</div>,
}));
```

### 6. Organize Tests with describe Blocks

```typescript
describe('PropertyForm', () => {
  describe('Validation', () => {
    it('validates required fields', () => {});
    it('validates price range', () => {});
  });

  describe('Submission', () => {
    it('submits valid data', () => {});
    it('handles submission errors', () => {});
  });

  describe('User Interactions', () => {
    it('updates preview on input change', () => {});
  });
});
```

## Mocked Dependencies

The following are automatically mocked in `jest.setup.ts`:

- **next/navigation**: Router, pathname, search params
- **next-intl**: Translations (returns key as-is)
- **Google Maps API**: Map, Marker, Autocomplete
- **IntersectionObserver**: For components using viewport detection
- **ResizeObserver**: For components using resize detection

## Coverage Thresholds

Current coverage requirements:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

These thresholds are enforced in CI/CD and will fail builds if not met.

## CI/CD Integration

Tests run automatically on:
- Every push to `main`, `trunk`, or `develop`
- Every pull request to `main` or `trunk`

The CI pipeline:
1. Runs tests with coverage
2. Uploads coverage reports to Codecov
3. Fails the build if tests fail or coverage is below threshold

## Debugging Tests

### Run a specific test file

```bash
yarn test button.test.tsx
```

### Run tests matching a pattern

```bash
yarn test --testNamePattern="validates"
```

### Debug in VS Code

Add this to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Common Issues

### Issue: "Cannot find module"

**Solution**: Check your `moduleNameMapper` in `jest.config.ts` matches your `tsconfig.json` paths.

### Issue: "Invalid hook call"

**Solution**: Make sure you're using the custom `render` from `test-utils.tsx`, not directly from `@testing-library/react`.

### Issue: "act() warning"

**Solution**: Wrap async operations in `waitFor()` or use `async/await` with userEvent.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Next Steps

### Recommended Tests to Add

1. **Page Component Tests**
   - Test main page layouts
   - Test error boundaries
   - Test loading states

2. **Form Tests**
   - Property creation form
   - Maintenance request form
   - Profile update form

3. **API Integration Tests**
   - Supabase queries
   - Firebase storage operations
   - Google Maps integration

4. **E2E Tests** (Future Phase)
   - Complete user workflows
   - Cross-browser testing
   - Mobile responsive testing

## Contributing

When adding new features:
1. Write tests first (TDD) or alongside your feature
2. Aim for meaningful coverage, not just high percentages
3. Test user interactions and edge cases
4. Run `yarn test:coverage` before submitting PR
5. Ensure all tests pass in CI/CD
