// ============================================================================
// BrokerOS — WhatsApp Automation Builder Step Tree: addressing + immutable mutation
// ============================================================================

export interface TreeStep<T> {
  cid: string;
  branches?: { yes: T[]; no: T[] };
}

export type ParentScope =
  | { kind: 'root' }
  | { kind: 'branch'; parentCid: string; branch: 'yes' | 'no' };

export type StepMarker =
  | { kind: 'root'; index: number }
  | { kind: 'branch'; branch: 'yes' | 'no'; index: number };

export type StepPath = StepMarker[];

export function childPath(
  basePath: StepPath,
  scope: ParentScope,
  index: number,
): StepPath {
  return [
    ...basePath,
    scope.kind === 'root'
      ? { kind: 'root', index }
      : { kind: 'branch', branch: scope.branch, index },
  ];
}

export function insertAt<T extends TreeStep<T>>(
  steps: T[],
  scope: ParentScope,
  index: number,
  node: T,
): T[] {
  if (scope.kind === 'root') {
    const copy = [...steps];
    copy.splice(index, 0, node);
    return copy;
  }
  return steps.map((step) => {
    if (!step.branches) return step;
    if (step.cid === scope.parentCid) {
      const bucket = [...step.branches[scope.branch]];
      bucket.splice(index, 0, node);
      return {
        ...step,
        branches: { ...step.branches, [scope.branch]: bucket },
      };
    }
    return {
      ...step,
      branches: {
        yes: insertAt(step.branches.yes, scope, index, node),
        no: insertAt(step.branches.no, scope, index, node),
      },
    };
  });
}

export function mapAtPath<T extends TreeStep<T>>(
  steps: T[],
  path: StepPath,
  updater: (step: T) => T,
): T[] {
  return atPath(steps, path, (bucket, index) =>
    bucket.map((step, i) => (i === index ? updater(step) : step)),
  );
}

export function removeAt<T extends TreeStep<T>>(
  steps: T[],
  path: StepPath,
): T[] {
  return atPath(steps, path, (bucket, index) =>
    bucket.filter((_, i) => i !== index),
  );
}

export function moveAt<T extends TreeStep<T>>(
  steps: T[],
  path: StepPath,
  direction: -1 | 1,
): T[] {
  return atPath(steps, path, (bucket, index) => {
    const target = index + direction;
    if (target < 0 || target >= bucket.length) return bucket;
    const copy = [...bucket];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    return copy;
  });
}

function atPath<T extends TreeStep<T>>(
  steps: T[],
  path: StepPath,
  edit: (bucket: T[], index: number) => T[],
): T[] {
  if (path.length === 0) return steps;
  const [head, ...rest] = path;

  if (rest.length === 0) return edit(steps, head.index);

  const next = rest[0];
  if (next.kind !== 'branch') return steps;
  return steps.map((step, i) => {
    if (i !== head.index || !step.branches) return step;
    return {
      ...step,
      branches: {
        ...step.branches,
        [next.branch]: atPath(step.branches[next.branch], rest, edit),
      },
    };
  });
}
