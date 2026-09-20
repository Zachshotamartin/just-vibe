#!/usr/bin/env node
import { main } from '../plugins/just-vibe/scripts/installer.mjs';
process.exitCode = main(process.argv.slice(2));
