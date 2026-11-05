// Dependency graphs are maps of id -> ids it depends on. Unknown targets are
// ignored here; callers validate that every dependency exists.
function search(dependencies, onCycle) {
  const done = new Set(), path = [], onPath = new Set();
  function visit(id) {
    if (onPath.has(id)) return onCycle([...path.slice(path.indexOf(id)), id]);
    if (done.has(id) || !Object.hasOwn(dependencies, id)) return false;
    path.push(id);
    onPath.add(id);
    for (const next of dependencies[id]) if (visit(next)) return true;
    path.pop();
    onPath.delete(id);
    done.add(id);
    return false;
  }
  for (const id of Object.keys(dependencies)) if (visit(id)) return;
}

export function findCycle(dependencies) {
  let found = null;
  search(dependencies, cycle => { found = cycle; return true; });
  return found;
}

export function assertAcyclic(dependencies, message) {
  if (findCycle(dependencies)) throw Error(message);
}

// Distinct cycles reachable by depth-first search, each rotated to start at its
// smallest id. This is a bounded diagnostic, not an enumeration of every cycle.
export function listCycles(dependencies, limit = 20) {
  const seen = new Map();
  search(dependencies, cycle => {
    const ring = cycle.slice(0, -1), start = ring.indexOf([...ring].sort()[0]);
    const rotated = [...ring.slice(start), ...ring.slice(0, start)];
    seen.set(rotated.join('>'), [...rotated, rotated[0]]);
    return seen.size >= limit;
  });
  return [...seen.values()];
}
