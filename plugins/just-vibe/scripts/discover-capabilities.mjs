#!/usr/bin/env node
import { main } from './toolkit.mjs';
process.exitCode = await main(['discover', ...process.argv.slice(2)]);
