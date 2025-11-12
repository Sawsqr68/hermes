/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { safeEval } = require('./local-eval');

/**
 * Test suite for safeEval function
 */

// Test counter
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (e) {
    console.error(`✗ ${description}`);
    console.error(`  ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertUndefined(actual, message) {
  if (actual !== undefined) {
    throw new Error(`${message || 'Assertion failed'}: expected undefined, got ${JSON.stringify(actual)}`);
  }
}

// JSON Parsing Tests
console.log('\n=== JSON Parsing Tests ===');

test('should parse valid JSON number', () => {
  assertEqual(safeEval('42'), 42, 'Failed to parse number');
});

test('should parse valid JSON string', () => {
  assertEqual(safeEval('"hello"'), "hello", 'Failed to parse string');
});

test('should parse valid JSON object', () => {
  assertEqual(safeEval('{"key":"value"}'), {key: "value"}, 'Failed to parse object');
});

test('should parse valid JSON array', () => {
  assertEqual(safeEval('[1,2,3]'), [1, 2, 3], 'Failed to parse array');
});

test('should parse valid JSON boolean', () => {
  assertEqual(safeEval('true'), true, 'Failed to parse boolean');
});

test('should parse valid JSON null', () => {
  assertEqual(safeEval('null'), null, 'Failed to parse null');
});

// Whitelist Command Tests
console.log('\n=== Whitelist Command Tests ===');

test('should execute noop command and return null', () => {
  assertEqual(safeEval('noop'), null, 'noop should return null');
});

test('should execute ping command and return pong', () => {
  assertEqual(safeEval('ping'), 'pong', 'ping should return pong');
});

// Security Tests - Malicious Strings
console.log('\n=== Security Tests - Malicious Strings ===');

test('should NOT execute arbitrary code from eval-like string', () => {
  const result = safeEval('console.log("hacked")');
  assertUndefined(result, 'Should return undefined for arbitrary code');
});

test('should NOT execute function call string', () => {
  const result = safeEval('process.exit(1)');
  assertUndefined(result, 'Should return undefined for process.exit');
});

test('should NOT execute malicious code with require', () => {
  const result = safeEval('require("fs").readFileSync("/etc/passwd")');
  assertUndefined(result, 'Should return undefined for require calls');
});

test('should NOT execute IIFE (Immediately Invoked Function Expression)', () => {
  const result = safeEval('(function(){return "pwned"})()');
  assertUndefined(result, 'Should return undefined for IIFE');
});

test('should NOT execute code with global object access', () => {
  const result = safeEval('global.process.exit(0)');
  assertUndefined(result, 'Should return undefined for global access');
});

test('should NOT execute code with this context', () => {
  const result = safeEval('this.constructor.constructor("return process")()');
  assertUndefined(result, 'Should return undefined for this.constructor tricks');
});

// Edge Cases
console.log('\n=== Edge Case Tests ===');

test('should return undefined for invalid JSON and non-whitelisted string', () => {
  const result = safeEval('not-json-and-not-whitelisted');
  assertUndefined(result, 'Should return undefined for invalid input');
});

test('should return undefined for empty string', () => {
  const result = safeEval('');
  assertUndefined(result, 'Should return undefined for empty string');
});

test('should return undefined for undefined input string', () => {
  const result = safeEval('undefined');
  assertUndefined(result, 'Should return undefined for undefined string');
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.error('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
