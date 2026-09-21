// Shared project configuration roots for discovery and static audit. Keep home
// adapters separate: selecting a project must not scan an unrelated user home.
export const PROJECT_HOST_PATHS = [
  '.adal', '.codebuddy', '.joycode', '.kiro', '.agents', '.pi', '.trae',
  '.kimi', '.kimi-code', '.qwen', '.windsurf', '.agent', '.cursor', '.opencode',
  '.github/skills', '.github/instructions', '.github/copilot-instructions.md',
  '.gemini', '.codex', '.claude',
  'opencode.json', 'opencode.jsonc', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md',
  '.mcp.json', '.lsp.json', '.claude.json',
];
