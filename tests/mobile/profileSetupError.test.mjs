import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getProfileSetupErrorMessage } from '../../apps/mobile/features/profile/lib/setupError.ts';

test('shows nested Payload field errors instead of the generic SDK message', () => {
  const error = Object.assign(new Error('Something went wrong'), {
    status: 400,
    errors: [
      {
        message: 'Validation failed',
        data: {
          errors: [
            { path: 'phone', message: 'This phone number is already registered.' },
            { path: 'type', message: 'Hospital type is required.' },
          ],
        },
      },
    ],
  });
  assert.equal(
    getProfileSetupErrorMessage(error),
    'This phone number is already registered.\nHospital type is required.'
  );
});

test('gives actionable session and permission errors', () => {
  assert.match(getProfileSetupErrorMessage({ status: 401 }), /sign in again/);
  assert.match(getProfileSetupErrorMessage({ status: 403 }), /permission/);
});

test('identifies server failure without exposing internal error details', () => {
  const message = getProfileSetupErrorMessage({ status: 500, message: 'private database details' });
  assert.match(message, /error 500/);
  assert.doesNotMatch(message, /private database details/);
});

test('preserves ordinary errors and handles empty responses', () => {
  assert.equal(
    getProfileSetupErrorMessage(new Error('Network request failed')),
    'Network request failed'
  );
  assert.match(getProfileSetupErrorMessage(null), /Could not create your profile/);
});
