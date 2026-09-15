import test from "node:test";
import assert from "node:assert/strict";
import { startPositionPolling } from "./executionPolling.js";
import { asList, validPosition, tourStatus } from "./responseUtils.js";

const position = { latitude: 44.8, longitude: 20.4 };
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}
function clock(t) { t.mock.timers.enable({ apis: ["setInterval"] }); }

test("waits 10 seconds, gets current position, then posts and displays the response", async (t) => {
  clock(t);
  const calls = [];
  const poll = startPositionPolling({
    readPosition: async () => { calls.push("GET"); return position; },
    updateLocation: async (point) => { assert.deepEqual(point, position); calls.push("POST"); return { status: "Started" }; },
    onUpdate: (value) => calls.push(value.status),
    onError: (error) => { throw error; },
  });
  t.after(() => poll.stop(true));
  t.mock.timers.tick(9999); await flush();
  assert.deepEqual(calls, []);
  t.mock.timers.tick(1); await flush();
  assert.deepEqual(calls, ["GET", "POST", "Started"]);
  t.mock.timers.tick(10000); await flush();
  assert.equal(calls.length, 6);
});

test("slow GET and POST never overlap subsequent ticks", async (t) => {
  clock(t);
  const get = deferred(), post = deferred();
  let gets = 0, posts = 0, updates = 0;
  const poll = startPositionPolling({
    readPosition: () => { gets++; return get.promise; },
    updateLocation: () => { posts++; return post.promise; },
    onUpdate: () => updates++,
    onError: assert.fail,
  });
  t.after(() => poll.stop(true));
  t.mock.timers.tick(10000); await flush();
  t.mock.timers.tick(30000); await flush();
  assert.equal(gets, 1); assert.equal(posts, 0);
  get.resolve(position); await flush();
  t.mock.timers.tick(30000); await flush();
  assert.equal(gets, 1); assert.equal(posts, 1);
  post.resolve({ status: "Started" }); await flush();
  assert.equal(updates, 1);
});

test("GET and POST errors are reported and tracking retries at the next tick", async (t) => {
  clock(t);
  let gets = 0, posts = 0, updates = 0;
  const errors = [];
  const poll = startPositionPolling({
    readPosition: async () => { if (++gets === 1) throw new Error("GET failed"); return position; },
    updateLocation: async () => { if (++posts === 1) throw new Error("POST failed"); return {}; },
    onUpdate: () => updates++,
    onError: (error) => errors.push(error.message),
  });
  t.after(() => poll.stop(true));
  for (let i = 0; i < 3; i++) { t.mock.timers.tick(10000); await flush(); }
  assert.deepEqual(errors, ["GET failed", "POST failed"]);
  assert.equal(updates, 1);
});

test("navigation aborts a pending GET and never sends its late coordinates", async (t) => {
  clock(t);
  const request = deferred();
  let signal, posts = 0, updates = 0;
  const poll = startPositionPolling({
    readPosition: (value) => { signal = value; return request.promise; },
    updateLocation: async () => { posts++; return {}; },
    onUpdate: () => updates++,
    onError: assert.fail,
  });
  t.mock.timers.tick(10000); await flush();
  const stopped = poll.stop(true);
  assert.equal(signal.aborted, true);
  request.resolve(position); await stopped;
  t.mock.timers.tick(30000); await flush();
  assert.equal(posts, 0); assert.equal(updates, 0);
});

test("stopping drains an in-flight POST and suppresses its stale response", async (t) => {
  clock(t);
  const post = deferred();
  let settled = false, updates = 0, posts = 0;
  const poll = startPositionPolling({
    readPosition: async () => position,
    updateLocation: () => { posts++; return post.promise; },
    onUpdate: () => updates++,
    onError: assert.fail,
  });
  t.mock.timers.tick(10000); await flush();
  const stopped = poll.stop().then(() => { settled = true; });
  await flush();
  assert.equal(settled, false);
  post.resolve({ status: "Started" }); await stopped;
  t.mock.timers.tick(30000); await flush();
  assert.equal(posts, 1); assert.equal(updates, 0); assert.equal(settled, true);
});

test("missing or invalid simulator coordinates never generate a POST", async (t) => {
  clock(t);
  let errors = 0, posts = 0;
  const poll = startPositionPolling({
    readPosition: async () => ({ latitude: null, longitude: 20 }),
    updateLocation: async () => { posts++; return {}; },
    onUpdate: assert.fail,
    onError: () => errors++,
  });
  t.after(() => poll.stop(true));
  t.mock.timers.tick(10000); await flush();
  assert.equal(errors, 1); assert.equal(posts, 0);
});

test("nullable collections and geographic bounds", () => {
  assert.deepEqual(asList(null), []);
  assert.deepEqual(asList({}), []);
  assert.deepEqual(asList([null, "tag"]), ["tag"]);
  assert.equal(validPosition({ latitude: 0, longitude: 0 }), true);
  assert.equal(validPosition({ latitude: "", longitude: "" }), false);
  assert.equal(validPosition({ latitude: 91, longitude: 0 }), false);
  assert.equal(tourStatus(0), "Draft");
  assert.equal(tourStatus(1), "Published");
  assert.equal(tourStatus(2), "Archived");
});