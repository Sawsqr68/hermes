/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Whitelist of allowed string commands
const COMMAND_WHITELIST = {
  'noop': function() {
    return null;
  },
  'ping': function() {
    return 'pong';
  }
};

/**
 * Safe evaluation function that replaces unsafe eval() calls.
 * Attempts to parse JSON first, falls back to a whitelist of safe commands.
 * 
 * @param {string} x - The input string to evaluate safely
 * @returns {*} Parsed JSON value or result of whitelisted command
 */
function safeEval(x) {
  // First, try to parse as JSON
  try {
    return JSON.parse(x);
  } catch (e) {
    // Not valid JSON, check whitelist of allowed commands
  }
  
  // Check if the input matches a whitelisted command
  if (typeof x === 'string' && Object.prototype.hasOwnProperty.call(COMMAND_WHITELIST, x)) {
    return COMMAND_WHITELIST[x]();
  }
  
  // If not JSON and not in whitelist, return undefined (safe default)
  return undefined;
}

// Export for testability
module.exports = { safeEval };