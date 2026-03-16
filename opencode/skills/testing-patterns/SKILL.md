---
name: testing-patterns
description: Testing conventions and patterns for Angular applications. Covers unit tests with Vitest, integration tests, and E2E tests with Playwright. Use when selecting test strategies, structuring test files, choosing mocking approaches, or writing tests for Angular components, services, directives, pipes, and guards.
---

## Framework stack

- **Unit / Integration:** Vitest + Angular Testing Library
- **E2E:** Playwright
- **Coverage:** Vitest built-in coverage (v8 provider)
- **HTTP mocking (unit/integration):** `provideHttpClientTesting` from `@angular/common/http/testing`
- **API mocking (E2E):** Playwright route interception (`page.route()`)

If the project uses a different stack (Jest, Karma, Cypress), adapt these
patterns to that framework while preserving the structural conventions.

## File structure

```
src/
  app/
    features/
      auth/
        login.component.ts
        login.component.spec.ts          # Unit tests colocated
        login.service.ts
        login.service.spec.ts
    shared/
      pipes/
        currency-format.pipe.ts
        currency-format.pipe.spec.ts

e2e/
  fixtures/
    auth.fixture.ts                      # Reusable setup (login state, mocked user)
    api-mocks.fixture.ts                 # Centralized API mock definitions
  pages/
    login.page.ts                        # Page Object Model
    dashboard.page.ts
  specs/
    auth/
      login.spec.ts                      # E2E test
      logout.spec.ts
  playwright.config.ts
```

### Naming rules

- Unit/integration test files: `<name>.spec.ts`, colocated with the source file.
- E2E test files: `<name>.spec.ts` inside `e2e/specs/`, grouped by feature.
- Page objects: `<name>.page.ts` inside `e2e/pages/`.
- Fixtures: `<name>.fixture.ts` inside `e2e/fixtures/`.
- Test descriptions: use natural language that reads as a specification.

## Unit tests

### Components

Use Angular Testing Library for component tests. Test behavior through the
rendered DOM, not component internals.

```typescript
import { render, screen, fireEvent } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import { AuthService } from './auth.service';

describe('LoginComponent', () => {
  it('should disable submit button when form is invalid', async () => {
    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: { login: vi.fn() } }
      ]
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call auth service with credentials on valid submit', async () => {
    const loginSpy = vi.fn().mockReturnValue(of({ token: 'abc' }));

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: { login: loginSpy } }
      ]
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await fireEvent.input(emailInput, { target: { value: 'user@test.com' } });
    await fireEvent.input(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(submitButton);

    expect(loginSpy).toHaveBeenCalledWith('user@test.com', 'password123');
  });
});
```

**Rules:**
- Query by accessible role, label, or text. Never by CSS class or component selector.
- Mock services at the injection boundary, not HTTP calls (that is for integration tests).
- One `describe` per component, one `it` per behavior.
- Do not test Angular internals (change detection, lifecycle hooks) unless that
  is the specific behavior under test.

### Services

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return a token on successful login', () => {
    const mockResponse = { token: 'abc-123', expiresIn: 3600 };

    service.login('user@test.com', 'password123').subscribe(response => {
      expect(response.token).toBe('abc-123');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should propagate server errors', () => {
    service.login('user@test.com', 'wrong').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
```

**Rules:**
- Use `provideHttpClientTesting` for HTTP-dependent services. Always call
  `httpMock.verify()` in `afterEach`.
- Test the service contract: inputs, outputs, and side effects. Not the
  implementation of private methods.
- For services with state (signals, BehaviorSubjects), test state transitions.

### Pipes and directives

```typescript
describe('CurrencyFormatPipe', () => {
  const pipe = new CurrencyFormatPipe();

  it('should format number as EUR currency', () => {
    expect(pipe.transform(1234.5)).toBe('1.234,50 €');
  });

  it('should handle null gracefully', () => {
    expect(pipe.transform(null)).toBe('—');
  });
});
```

**Rules:**
- Pure pipes: instantiate directly, no TestBed needed.
- Impure pipes and directives: use Angular Testing Library to render a host component.

### Guards and interceptors

```typescript
describe('AuthGuard', () => {
  it('should redirect to login when unauthenticated', () => {
    const authService = { isAuthenticated: vi.fn().mockReturnValue(false) };
    const router = { navigate: vi.fn() };

    const guard = new AuthGuard(
      authService as any,
      router as any
    );

    const result = guard.canActivate();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

**Rules:**
- Mock dependencies manually for guards. Prefer constructor injection over
  functional guards when testability matters.
- For interceptors, use `HttpTestingController` with a real `HttpClient` pipeline.

## Integration tests

Integration tests verify that two or more Angular constructs work together
correctly. They use the same file naming convention (`.spec.ts`) and colocate
with the feature they test.

**When to use integration tests instead of unit tests:**
- A component delegates significant logic to a child component or service.
- A service composes multiple other services.
- A route guard depends on a service that depends on HTTP.

**Rules:**
- Use real implementations for internal collaborators. Mock only external
  boundaries (HTTP, browser APIs, third-party SDKs).
- Use `provideHttpClientTesting` to intercept HTTP at the boundary.
- If the integration requires routing, use `RouterTestingHarness`.
- Keep integration tests fewer than unit tests. They validate wiring, not
  exhaustive behavior.

## E2E tests

### Environment strategy

E2E tests run against a local development server with mocked API responses.
This is a deliberate decision for the following reasons:

- **Security:** the application may require authentication against systems with
  sensitive data. A dev server with mocked responses eliminates exposure.
- **Determinism:** mocked responses produce consistent test results regardless
  of backend state or availability.
- **Speed:** no dependency on external services means faster and more reliable
  test execution.
- **Isolation:** tests validate frontend behavior independently from backend
  correctness.

The dev server should be configured with:
- A mock API layer (Playwright route interception or a local mock server).
- Authentication bypassed or simulated via mocked tokens.
- No connection to real backend services or databases.

### Playwright configuration

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx ng serve --configuration=mock',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
```

**Key points:**
- `webServer` starts the Angular dev server automatically with a mock
  configuration. Playwright manages the server lifecycle.
- `trace: 'on-first-retry'` captures traces only on failure retries,
  balancing debugging capability with performance.
- `screenshot: 'only-on-failure'` provides visual evidence for debugging.

### Page Object Model

```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

**Rules:**
- One page object per page or major section.
- Locators use accessible selectors: `getByRole`, `getByLabel`, `getByText`.
- Page objects encapsulate navigation and interaction. Assertions stay in the
  test file.
- Do not use `data-testid` unless no accessible alternative exists.

### API mocking with route interception

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Mock the login API
    await page.route('**/api/auth/login', async (route) => {
      const body = route.request().postDataJSON();
      if (body.email === 'user@test.com' && body.password === 'correct') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'mock-jwt-token', expiresIn: 3600 }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      }
    });

    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should navigate to dashboard on successful login', async ({ page }) => {
    await loginPage.login('user@test.com', 'correct');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error message on invalid credentials', async ({ page }) => {
    await loginPage.login('user@test.com', 'wrong');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });
});
```

**Rules:**
- Mock all API calls via `page.route()`. Never let E2E tests hit real endpoints.
- Use fixtures (`e2e/fixtures/`) to centralize mock definitions shared across tests.
- Wait for specific conditions (`toHaveURL`, `toBeVisible`, network responses),
  never use `page.waitForTimeout()`.
- Keep E2E tests focused on critical user journeys. If a behavior can be
  validated with a unit test, do it there instead.

### Authentication simulation

For applications that require authentication:

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Set a mock JWT token in storage before navigating
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-testing');
    });

    // Mock the token validation endpoint
    await page.route('**/api/auth/validate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          user: { id: '1', email: 'test@bank.com', role: 'user' },
        }),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

**Rules:**
- Never use real credentials in E2E tests.
- Simulate authentication by injecting tokens and mocking validation endpoints.
- Create a shared fixture so all authenticated tests use the same mechanism.
- If the application uses SSO or OAuth, mock the callback redirect with a
  pre-set token rather than simulating the full redirect flow.

## Test execution order

When running the full test suite:

1. **Unit tests first** (fastest, highest signal-to-noise ratio).
2. **Integration tests second** (validate wiring between units).
3. **E2E tests last** (slowest, validate critical user journeys).

If unit tests fail, do not proceed to integration or E2E. Fix unit tests first.

## Coverage guidelines

- Aim for high coverage on services, guards, interceptors, and pipes (>80%).
- For components, cover the interaction surface (user events, rendered output)
  rather than template details.
- Do not pursue 100% coverage. Untested code should be code that is trivial
  or framework-generated.
- Use Vitest coverage reports to identify untested error paths and branching logic.

## Anti-patterns to avoid

- **Testing implementation details:** accessing private properties, spying on
  internal method calls, asserting on DOM structure rather than content.
- **Over-mocking:** replacing internal collaborators that should be tested
  together. Mock at the boundary, not in the middle.
- **Snapshot abuse:** snapshot tests for components are brittle and low-signal.
  Use them only for serializable data structures, not rendered HTML.
- **Shared mutable state:** tests that depend on execution order or modify
  shared variables. Each test must be independent.
- **Fixed timeouts in E2E:** `page.waitForTimeout(3000)` is a flaky test
  waiting to happen. Wait for specific conditions instead.
- **Testing framework code:** do not test that Angular's `@Input` decorator
  works. Test what your code does with the input.
