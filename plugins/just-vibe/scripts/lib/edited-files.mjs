// Normalize paths from edit tools without retaining or executing patch contents.
export function editedFiles(event) {
  const input = event.tool_input;
  const files = [input?.file_path, input?.path];
  if (Array.isArray(input?.edits))
    for (const edit of input.edits.slice(0, 200)) files.push(edit?.file_path, edit?.path);
  if (event.tool_name === 'apply_patch') {
    const patch =
      typeof input === 'string' ? input : input?.patch || input?.input || input?.command;
    if (typeof patch === 'string' && patch.length <= 100000)
      for (const match of patch.matchAll(
        /^\*\*\* (?:Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$/gm,
      ))
        files.push(match[1] || match[2]);
  }
  return [
    ...new Set(files.filter((file) => typeof file === 'string' && file && file.length <= 4000)),
  ];
}
