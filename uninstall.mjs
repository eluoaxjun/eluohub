#!/usr/bin/env node
// uninstall.mjs - Eluo Hub Plugin Uninstaller for Claude Code
// Usage: node uninstall.mjs

import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const MARKETPLACE_ID = 'eluo-hub';
const PLUGIN_NAME = 'eluo-hub';
const pluginKey = `${PLUGIN_NAME}@${MARKETPLACE_ID}`;

const claudeDir = join(homedir(), '.claude');
const pluginsDir = join(claudeDir, 'plugins');

console.log('');
console.log('  Eluo Hub Plugin Uninstaller');
console.log('  ----------------------------------------');
console.log('');

if (!existsSync(claudeDir)) {
  console.log('  Claude Code not found. Nothing to uninstall.');
  process.exit(0);
}

let removed = false;

// ── Step 1: Disable plugin ──
const settingsPath = join(claudeDir, 'settings.json');
if (existsSync(settingsPath)) {
  const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
  if (settings.enabledPlugins && pluginKey in settings.enabledPlugins) {
    delete settings.enabledPlugins[pluginKey];
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('[1/3] Plugin disabled.');
    removed = true;
  } else {
    console.log('[1/3] Plugin was not enabled.');
  }
}

// ── Step 2: Remove from installed_plugins.json ──
const installedPath = join(pluginsDir, 'installed_plugins.json');
if (existsSync(installedPath)) {
  const installed = JSON.parse(readFileSync(installedPath, 'utf-8'));
  if (installed.plugins && pluginKey in installed.plugins) {
    delete installed.plugins[pluginKey];
    writeFileSync(installedPath, JSON.stringify(installed, null, 2));
    console.log('[2/3] Plugin registration removed.');
    removed = true;
  } else {
    console.log('[2/3] Plugin was not registered.');
  }
}

// ── Step 3: Remove cache and marketplace ──
const cacheDir = join(pluginsDir, 'cache', MARKETPLACE_ID);
const marketplaceDir = join(pluginsDir, 'marketplaces', MARKETPLACE_ID);

if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
  console.log('[3/3] Cache removed.');
  removed = true;
} else {
  console.log('[3/3] No cache to remove.');
}

if (existsSync(marketplaceDir)) {
  rmSync(marketplaceDir, { recursive: true, force: true });
  console.log('      Marketplace clone removed.');
}

// Remove from known_marketplaces.json
const knownPath = join(pluginsDir, 'known_marketplaces.json');
if (existsSync(knownPath)) {
  const known = JSON.parse(readFileSync(knownPath, 'utf-8'));
  if (MARKETPLACE_ID in known) {
    delete known[MARKETPLACE_ID];
    writeFileSync(knownPath, JSON.stringify(known, null, 2));
    console.log('      Marketplace registration removed.');
  }
}

console.log('');
if (removed) {
  console.log('  eluo-hub uninstalled successfully.');
  console.log('  Restart Claude Code to complete removal.');
} else {
  console.log('  eluo-hub was not installed.');
}
console.log('');
