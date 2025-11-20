import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

/**
 * Global test environment setup for Jest + Angular.
 *
 * This configures Angular’s testing zone and ensures that any
 * unknown components or inputs referenced during tests will throw
 * an error. This helps catch template mistakes early.
 */
setupZoneTestEnv({
  errorOnUnknownElements: true,      // Fail tests if a component is missing
  errorOnUnknownProperties: true,    // Fail tests if an input/output is invalid
});
