import { expect, test } from '@playwright/test';
import { getSignupDestination, getOnboardingPath } from '../../lib/auth/signup-routing';

test('accepts only supported signup destinations', () => {
  const event = '/events/sample-event/register';
  expect(getSignupDestination(event)).toBe(event);
  expect(getSignupDestination('/members/profile')).toBe('/members/profile');
  expect(getOnboardingPath('/members/profile', true)).toBe('/members/profile');
  for (const invalid of [null, '//example.org', '/%2fexample.org', 'https://example.org', '/events/a/register?x=1', '/events/a/register#fragment', '/events/a/register/extra', '/events/a%2fb/register', '/events/a\\register', '/events/sample-event/register\n', '/events/sample-event/register\r\n']) {
    expect(getSignupDestination(invalid)).toBe('/events');
  }
  expect(getOnboardingPath(event, false)).toBe('/profile/setup?next=%2Fevents%2Fsample-event%2Fregister');
  expect(getOnboardingPath(event, true)).toBe(event);
});
