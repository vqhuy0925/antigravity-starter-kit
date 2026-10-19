#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { readInput, outputDecision } = require('./lib');

const payload = readInput();
if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') {
  outputDecision('allow');
}

const cmd = (payload.toolCall.args && payload.toolCall.args.CommandLine) || '';
const cwd = (payload.toolCall.args && payload.toolCall.args.Cwd) || process.cwd();

// Only check when a git commit command is executed
if (!/\bgit\s+commit\b/.test(cmd)) {
  outputDecision('allow');
}

const IGNORED_FILES = new Set([
  'implementation_plan.md',
  'task.md',
  'walkthrough.md',
  'test_cases.md',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
]);

function findPlanFile(startDir, artifactDir) {
  if (artifactDir) {
    const artPlan = path.join(artifactDir, 'implementation_plan.md');
    if (fs.existsSync(artPlan)) return artPlan;
  }
  let current = startDir;
  for (let i = 0; i < 4; i++) {
    const candidate = path.join(current, 'implementation_plan.md');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

try {
  const planPath = findPlanFile(cwd, payload.artifactDirectoryPath);
  if (!planPath) {
    outputDecision('allow');
  }

  const planText = fs.readFileSync(planPath, 'utf8');

  // Get staged files from git
  const stagedOutput = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8', timeout: 5000 }).trim();
  if (!stagedOutput) {
    outputDecision('allow');
  }

  const stagedFiles = stagedOutput.split(/\r?\n/).filter(Boolean);
  const unmentionedFiles = [];

  for (const file of stagedFiles) {
    const base = path.basename(file);
    if (IGNORED_FILES.has(base) || base.endsWith('.lock') || base.startsWith('test_cases_')) {
      continue;
    }
    // Check if filename is mentioned in the plan
    if (!planText.includes(base) && !planText.includes(file)) {
      unmentionedFiles.push(file);
    }
  }

  if (unmentionedFiles.length > 0) {
    outputDecision('ask', `⚠️ Scope Creep Detected by Antigravity Guardrail: Staged files not mentioned in implementation_plan.md: [${unmentionedFiles.join(', ')}]. Do you want to proceed with this commit?`);
  }
} catch (err) {
  // Gracefully fallback to allow on any git execution failure
  outputDecision('allow');
}

outputDecision('allow');
