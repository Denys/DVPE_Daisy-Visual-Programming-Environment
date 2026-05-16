import { beforeEach, describe, expect, it } from 'vitest';
import type { SerializedProject } from '@/types';
import {
  clearAutosavedProject,
  loadAutosavedProject,
  loadRecentProjectSnapshot,
  saveAutosavedProject,
  getRecentProjects,
  recordRecentProject,
} from '../projectPersistence';

const project = (name = 'Autosave Test'): SerializedProject => ({
  version: '1.0.0',
  patch: {
    metadata: {
      name,
      author: 'test',
      created: '2026-05-15T00:00:00.000Z',
      modified: '2026-05-15T00:00:00.000Z',
      version: '1.0.0',
      targetHardware: 'field',
      sampleRate: 48000,
      blockSize: 48,
    },
    blocks: [],
    connections: [],
  },
});

describe('projectPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a valid autosaved project', () => {
    const saved = project();

    saveAutosavedProject(saved);

    expect(loadAutosavedProject()?.project).toEqual(saved);
  });

  it('ignores invalid autosave payloads', () => {
    localStorage.setItem('dvpe-autosave-project', JSON.stringify({ project: { patch: {} } }));

    expect(loadAutosavedProject()).toBeNull();
  });

  it('clears autosaved projects', () => {
    saveAutosavedProject(project());

    clearAutosavedProject();

    expect(loadAutosavedProject()).toBeNull();
  });

  it('records recent projects without duplicating ids', () => {
    recordRecentProject({ id: 'autosave', name: 'First', source: 'autosave' });
    recordRecentProject({ id: 'autosave', name: 'Second', source: 'autosave' });

    expect(getRecentProjects()).toEqual([
      expect.objectContaining({ id: 'autosave', name: 'Second', source: 'autosave' }),
    ]);
  });

  it('stores snapshots for browser-openable recent projects', () => {
    const snapshot = project('Browser Recent');

    recordRecentProject({
      id: 'browser:recent.dvpe',
      name: 'Browser Recent',
      source: 'browser',
      snapshot,
    });

    expect(loadRecentProjectSnapshot('browser:recent.dvpe')).toEqual(snapshot);
  });
});
