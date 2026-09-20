#!/usr/bin/env node
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';
process.exitCode = await main(process.argv.slice(2));
