#!/usr/bin/env node
import { main } from './toolkit.mjs';
process.exitCode = await main(['inspect', ...process.argv.slice(2)]);
