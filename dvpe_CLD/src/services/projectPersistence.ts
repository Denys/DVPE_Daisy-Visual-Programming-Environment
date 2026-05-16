import type { SerializedProject } from '@/types';

const AUTOSAVE_KEY = 'dvpe-autosave-project';
const RECENTS_KEY = 'dvpe-recent-projects';
const MAX_RECENT_PROJECTS = 8;

export interface AutosavedProject {
  project: SerializedProject;
  savedAt: string;
}

export interface RecentProject {
  id: string;
  name: string;
  source: 'autosave' | 'browser' | 'tauri' | 'folder';
  path?: string;
  savedAt: string;
  snapshot?: SerializedProject;
}

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage;
};

const isSerializedProject = (value: unknown): value is SerializedProject => {
  const candidate = value as SerializedProject | undefined;
  return (
    !!candidate &&
    typeof candidate === 'object' &&
    candidate.version === '1.0.0' &&
    !!candidate.patch &&
    typeof candidate.patch === 'object' &&
    !!candidate.patch.metadata &&
    Array.isArray(candidate.patch.blocks) &&
    Array.isArray(candidate.patch.connections)
  );
};

export const saveAutosavedProject = (project: SerializedProject): void => {
  const storage = getStorage();
  if (!storage || !isSerializedProject(project)) {
    return;
  }

  const savedAt = new Date().toISOString();
  storage.setItem(AUTOSAVE_KEY, JSON.stringify({ project, savedAt }));
  recordRecentProject({
    id: 'autosave',
    name: project.patch.metadata.name || 'Autosaved Patch',
    source: 'autosave',
    savedAt,
  });
};

export const loadAutosavedProject = (): AutosavedProject | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(AUTOSAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AutosavedProject>;
    if (!isSerializedProject(parsed.project)) {
      return null;
    }

    return {
      project: parsed.project,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

export const clearAutosavedProject = (): void => {
  getStorage()?.removeItem(AUTOSAVE_KEY);
};

export const getRecentProjects = (): RecentProject[] => {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(RECENTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is RecentProject =>
        !!item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.savedAt === 'string' &&
        (item.source === 'autosave' || item.source === 'browser' || item.source === 'tauri' || item.source === 'folder')
    );
  } catch {
    return [];
  }
};

export const loadRecentProjectSnapshot = (id: string): SerializedProject | null => {
  const recent = getRecentProjects().find((item) => item.id === id);
  if (recent?.snapshot && isSerializedProject(recent.snapshot)) {
    return recent.snapshot;
  }

  if (id === 'autosave') {
    return loadAutosavedProject()?.project ?? null;
  }

  return null;
};

export const recordRecentProject = (project: Omit<RecentProject, 'savedAt'> & { savedAt?: string }): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const savedAt = project.savedAt || new Date().toISOString();
  const snapshot = project.snapshot && isSerializedProject(project.snapshot) ? project.snapshot : undefined;
  const nextProject: RecentProject = { ...project, snapshot, savedAt };
  const existing = getRecentProjects().filter((item) => item.id !== nextProject.id);
  storage.setItem(RECENTS_KEY, JSON.stringify([nextProject, ...existing].slice(0, MAX_RECENT_PROJECTS)));
};
