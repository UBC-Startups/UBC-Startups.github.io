import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import test from 'node:test';

const requireFromWeb = createRequire(
  new URL('../../../web/package.json', import.meta.url),
);
const { createClient } = requireFromWeb('@supabase/supabase-js');

const LOCAL_URL = process.env.LOCAL_SUPABASE_URL;
const SERVICE_KEY = process.env.LOCAL_SUPABASE_SERVICE_KEY;
const PUBLISHABLE_KEY = process.env.LOCAL_SUPABASE_PUBLISHABLE_KEY;

function assertLocalConfiguration() {
  assert.ok(LOCAL_URL, 'LOCAL_SUPABASE_URL is required');
  assert.ok(SERVICE_KEY, 'LOCAL_SUPABASE_SERVICE_KEY is required');

  let url;
  try {
    url = new URL(LOCAL_URL);
  } catch {
    assert.fail('LOCAL_SUPABASE_URL must be a valid URL');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '');
  assert.ok(
    host === '127.0.0.1' || host === 'localhost' || host === '::1',
    'LOCAL_SUPABASE_URL must point at a loopback host',
  );
}

function clientOptions() {
  return {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };
}

function firstRow(data) {
  assert.ok(Array.isArray(data) && data.length > 0, 'RPC returned no row');
  return data[0];
}

test('event registration RPCs save one seat and reject browser roles', async (t) => {
  assertLocalConfiguration();
  assert.ok(
    PUBLISHABLE_KEY,
    'LOCAL_SUPABASE_PUBLISHABLE_KEY is required for the denial check',
  );

  const service = createClient(LOCAL_URL, SERVICE_KEY, clientOptions());
  const runId = randomUUID().replaceAll('-', '').slice(0, 12);

  const instantEventId = randomUUID();
  const applicationEventId = randomUUID();
  const eventIds = [instantEventId, applicationEventId];

  const createdAuthUsers = [];
  const userIds = [];
  const emailFor = (name) => `${name}-${runId}@example.test`;
  const password = `local-${randomUUID()}`;

  async function createSyntheticUser(name) {
    const { data, error } = await service.auth.admin.createUser({
      email: emailFor(name),
      password,
      email_confirm: true,
    });
    assert.ifError(error);
    assert.ok(data.user, `auth user ${name} was not created`);
    createdAuthUsers.push(data.user.id);
    userIds.push(data.user.id);
    return data.user.id;
  }

  async function cleanup() {
    const failures = [];

    // Every operation is attempted so one failure cannot strand the rest of
    // the synthetic fixtures. Supabase reports failures in `error` rather than
    // by rejecting, so both paths are surfaced after the cleanup pass.
    const attempt = async (description, operation) => {
      try {
        const { error } = await operation();
        if (error) {
          failures.push(`${description}: ${error.message ?? error.code ?? 'unknown error'}`);
        }
      } catch (error) {
        failures.push(
          `${description}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    await attempt('delete event registrations', () =>
      service.from('event_registrations').delete().in('event_id', eventIds),
    );
    await attempt('delete events', () =>
      service.from('events').delete().in('id', eventIds),
    );
    await attempt('delete profiles', () =>
      service.from('profiles').delete().in('user_id', userIds),
    );

    for (const userId of createdAuthUsers) {
      await attempt(`delete auth user ${userId}`, () =>
        service.auth.admin.deleteUser(userId),
      );
    }

    if (failures.length > 0) {
      throw new Error(`Integration cleanup failed:\n${failures.join('\n')}`);
    }
  }

  t.after(cleanup);

  // Synthetic accounts and profiles. Profiles reference auth.users, so create
  // the auth accounts first and use their generated IDs everywhere.
  const userA = await createSyntheticUser('instant-a');
  const userB = await createSyntheticUser('instant-b');
  const applicationUser = await createSyntheticUser('application');
  const browserUser = await createSyntheticUser('browser');
  const occupant = await createSyntheticUser('occupant');

  const { error: profileError } = await service.from('profiles').insert(
    userIds.map((userId) => ({
      user_id: userId,
      first_name: `Synthetic${userId.slice(0, 4)}`,
      last_name: 'Tester',
    })),
  );
  assert.ifError(profileError);

  // A fresh capacity-one instant event.
  const opensAt = new Date(Date.now() - 60_000).toISOString();
  const closesAt = new Date(Date.now() + 60 * 60_000).toISOString();

  const { error: instantEventError } = await service.from('events').insert({
    id: instantEventId,
    slug: `it-instant-${runId}`,
    registration_opens_at: opensAt,
    registration_closes_at: closesAt,
    capacity: 1,
    signup_mode: 'instant',
  });
  assert.ifError(instantEventError);

  // Two callers race for the single seat.
  const [resultA, resultB] = await Promise.all([
    service.rpc('submit_event_registration', {
      p_event_id: instantEventId,
      p_user_id: userA,
      p_answers: { firstName: 'Ada', interests: ['systems', 'design'] },
      p_accepted_agreements: [],
    }),
    service.rpc('submit_event_registration', {
      p_event_id: instantEventId,
      p_user_id: userB,
      p_answers: { firstName: 'Grace', interests: ['compilers'] },
      p_accepted_agreements: [],
    }),
  ]);

  assert.ifError(resultA.error);
  assert.ifError(resultB.error);

  const raced = [firstRow(resultA.data), firstRow(resultB.data)];
  const outcomes = raced.map((row) => row.outcome).sort();
  assert.deepEqual(outcomes, ['full', 'saved']);

  const saved = raced.find((row) => row.outcome === 'saved');
  assert.equal(saved.status, 'confirmed');
  assert.ok(saved.submitted_at, 'saved result should include a timestamp');

  const { data: instantRows, error: instantRowsError } = await service
    .from('event_registrations')
    .select('user_id, status')
    .eq('event_id', instantEventId);
  assert.ifError(instantRowsError);
  assert.equal(instantRows.length, 1, 'exactly one seat should be written');
  assert.equal(instantRows[0].status, 'confirmed');
  assert.ok([userA, userB].includes(instantRows[0].user_id));

  // Application events accept a pending row at the cap without adding a seat.
  const { error: applicationEventError } = await service.from('events').insert({
    id: applicationEventId,
    slug: `it-application-${runId}`,
    registration_opens_at: opensAt,
    registration_closes_at: closesAt,
    capacity: 1,
    signup_mode: 'application',
  });
  assert.ifError(applicationEventError);

  const { error: occupantError } = await service
    .from('event_registrations')
    .insert({
      event_id: applicationEventId,
      user_id: occupant,
      answers: { seed: true },
      accepted_agreements: [],
      status: 'confirmed',
      submitted_at: new Date().toISOString(),
    });
  assert.ifError(occupantError);

  const { data: applicationData, error: applicationError } = await service.rpc(
    'submit_event_registration',
    {
      p_event_id: applicationEventId,
      p_user_id: applicationUser,
      p_answers: { team: 'alpha', skills: ['rust', 'sql'] },
      p_accepted_agreements: [],
    },
  );
  assert.ifError(applicationError);
  assert.equal(firstRow(applicationData).outcome, 'saved');
  assert.equal(firstRow(applicationData).status, 'pending');

  const { data: applicationRows, error: applicationRowsError } = await service
    .from('event_registrations')
    .select('user_id, status, answers')
    .eq('event_id', applicationEventId);
  assert.ifError(applicationRowsError);
  assert.equal(
    applicationRows.filter((row) => row.status === 'confirmed').length,
    1,
    'the pending row must not consume a confirmed seat',
  );
  const pendingRow = applicationRows.find((row) => row.user_id === applicationUser);
  assert.equal(pendingRow.status, 'pending');
  assert.deepEqual(pendingRow.answers.skills, ['rust', 'sql']);

  // A signed-in browser-role client cannot execute either routine directly.
  const browser = createClient(LOCAL_URL, PUBLISHABLE_KEY, clientOptions());
  const { error: signInError } = await browser.auth.signInWithPassword({
    email: emailFor('browser'),
    password,
  });
  assert.ifError(signInError);

  const submissionDenial = await browser.rpc('submit_event_registration', {
    p_event_id: instantEventId,
    p_user_id: browserUser,
    p_answers: {},
    p_accepted_agreements: [],
  });
  assert.ok(submissionDenial.error, 'authenticated must not execute submission');
  assert.equal(submissionDenial.error.code, '42501');
  assert.equal(submissionDenial.data, null);

  const availabilityDenial = await browser.rpc(
    'get_event_registration_availability',
    { p_event_id: instantEventId },
  );
  assert.ok(
    availabilityDenial.error,
    'authenticated must not execute availability',
  );
  assert.equal(availabilityDenial.error.code, '42501');
  assert.equal(availabilityDenial.data, null);
});
