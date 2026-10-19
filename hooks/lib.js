'use strict';

const fs = require('fs');

/**
 * Read JSON payload from stdin synchronously
 */
function readInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Write decision to stdout and terminate
 * @param {'allow' | 'deny' | 'ask' | 'force_ask'} decision
 * @param {string} [reason]
 */
function outputDecision(decision, reason) {
  const result = { decision: decision || 'allow' };
  if (reason) result.reason = reason;
  process.stdout.write(JSON.stringify(result));
  process.exit(0);
}

module.exports = {
  readInput,
  outputDecision
};
