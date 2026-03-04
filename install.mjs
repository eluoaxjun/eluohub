#!/usr/bin/env node
// install.mjs - Eluo Hub Plugin Installer for Claude Code
// Usage: node install.mjs

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MARKETPLACE_ID = 'eluo-hub';
const PLUGIN_NAME = 'eluo-hub';
const REPO_URL = 'https://github.com/eluoaxjun/eluohub.git';

// Read version from marketplace.json
const marketplaceJsonPath = join(__dirname, '.claude-plugin', 'marketplace.json');
if (!existsSync(marketplaceJsonPath)) {
  console.error('Error: .claude-plugin/marketplace.json not found.');
  console.error('Run this script from the eluo-hub repo root directory.');
  process.exit(1);
}
const marketplaceJson = JSON.parse(readFileSync(marketplaceJsonPath, 'utf-8'));
const PLUGIN_VERSION = marketplaceJson.plugins[0].version;
const PLUGIN_SOURCE = marketplaceJson.plugins[0].source; // "./plugin"

// Paths
const claudeDir = join(homedir(), '.claude');
const pluginsDir = join(claudeDir, 'plugins');
const marketplacesDir = join(pluginsDir, 'marketplaces');
const cacheDir = join(pluginsDir, 'cache');
const pluginKey = `${PLUGIN_NAME}@${MARKETPLACE_ID}`;

console.log('');
console.log(`  Eluo Hub Plugin Installer v${PLUGIN_VERSION}`);
console.log('  ----------------------------------------');
console.log('');

// Verify Claude Code is installed
if (!existsSync(claudeDir)) {
  console.error('Error: ~/.claude directory not found.');
  console.error('Please install Claude Code first.');
  process.exit(1);
}

// Ensure plugins directory structure
mkdirSync(marketplacesDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

// ── Step 1: Register marketplace ──
console.log('[1/4] Registering marketplace...');
const marketplaceDir = join(marketplacesDir, MARKETPLACE_ID);

if (existsSync(marketplaceDir)) {
  console.log('       Marketplace exists. Updating...');
  try {
    execSync('git pull --ff-only', { cwd: marketplaceDir, stdio: 'pipe' });
  } catch {
    console.log('       Pull failed. Re-cloning...');
    rmSync(marketplaceDir, { recursive: true, force: true });
    execSync(`git clone "${REPO_URL}" "${marketplaceDir}"`, { stdio: 'pipe' });
  }
} else {
  execSync(`git clone "${REPO_URL}" "${marketplaceDir}"`, { stdio: 'pipe' });
}

// Get git commit SHA
const sha = execSync('git rev-parse HEAD', { cwd: marketplaceDir }).toString().trim();
console.log(`       Commit: ${sha.substring(0, 7)}`);

// ── Step 2: Copy plugin to cache ──
console.log('[2/4] Installing plugin to cache...');
const pluginCacheDir = join(cacheDir, MARKETPLACE_ID, PLUGIN_NAME, PLUGIN_VERSION);

// Clean existing cache for this version
if (existsSync(pluginCacheDir)) {
  rmSync(pluginCacheDir, { recursive: true, force: true });
}
mkdirSync(pluginCacheDir, { recursive: true });

// Resolve source directory (e.g., "./plugin" -> marketplaceDir/plugin)
const sourceDir = join(marketplaceDir, PLUGIN_SOURCE);
if (!existsSync(sourceDir)) {
  console.error(`Error: Plugin source directory not found: ${sourceDir}`);
  process.exit(1);
}

// Copy plugin files to cache
cpSync(sourceDir, pluginCacheDir, { recursive: true, force: true });
console.log(`       Cached: ${pluginCacheDir}`);

// ── Step 3: Update registry files ──
console.log('[3/4] Updating registry...');

// known_marketplaces.json
const knownPath = join(pluginsDir, 'known_marketplaces.json');
const known = existsSync(knownPath) ? JSON.parse(readFileSync(knownPath, 'utf-8')) : {};
known[MARKETPLACE_ID] = {
  source: { source: 'github', repo: 'eluoaxjun/eluohub' },
  installLocation: marketplaceDir,
  lastUpdated: new Date().toISOString()
};
writeFileSync(knownPath, JSON.stringify(known, null, 2));

// installed_plugins.json
const installedPath = join(pluginsDir, 'installed_plugins.json');
const installed = existsSync(installedPath)
  ? JSON.parse(readFileSync(installedPath, 'utf-8'))
  : { version: 2, plugins: {} };

installed.plugins[pluginKey] = [{
  scope: 'user',
  installPath: pluginCacheDir,
  version: PLUGIN_VERSION,
  installedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  gitCommitSha: sha
}];
writeFileSync(installedPath, JSON.stringify(installed, null, 2));

// ── Step 4: Enable plugin ──
console.log('[4/4] Enabling plugin...');
const settingsPath = join(claudeDir, 'settings.json');
const settings = existsSync(settingsPath)
  ? JSON.parse(readFileSync(settingsPath, 'utf-8'))
  : {};

if (!settings.enabledPlugins) settings.enabledPlugins = {};
settings.enabledPlugins[pluginKey] = true;
writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

// ── Done ──
console.log('');
console.log(`  eluo-hub v${PLUGIN_VERSION} installed successfully.`);
console.log('');
console.log('  Restart Claude Code to activate the plugin.');
console.log('');
