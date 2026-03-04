#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const ASP_DIR = join(homedir(), '.asp');
const isInitialized = existsSync(join(ASP_DIR, 'manifest.yaml'));

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

console.log('\n  datewithagent — let your agent date for you\n');

if (!isInitialized) {
  console.log('  First, let\'s create your ASP identity.\n');
  const check = spawnSync('asp', ['--version'], { stdio: 'ignore' });
  if (check.status !== 0) {
    console.log('  Installing asp-protocol...');
    spawnSync('npm', ['install', '-g', 'asp-protocol'], { stdio: 'inherit' });
  }
  spawnSync('asp', ['init', '--tags', 'dating'], { stdio: 'inherit' });
}

async function main() {
  const lookingFor = await ask('  Looking for (e.g. "someone into hiking and bad movies"): ');
  const location = await ask('  Your city: ');
  const vibe = await ask('  Your vibe in 3 words: ');

  const datingProfile = { lookingFor, location, vibe, created: new Date().toISOString() };
  const datingDir = join(ASP_DIR, 'dating');
  mkdirSync(datingDir, { recursive: true });
  writeFileSync(join(datingDir, 'preferences.json'), JSON.stringify(datingProfile, null, 2));

  spawnSync('asp', ['index', 'add'], { stdio: 'inherit' });

  console.log('\n  Your dating card is ready!');
  console.log('  Share your ASP URL — it\'s your dating card.');
  console.log('  As more people join, your agent will find matches.\n');
}

main();
