import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { modules } from '@/data/course';
import {
  $learner,
  $notes,
  BackupError,
  applyBackup,
  backupFilename,
  createBackup,
  parseBackup,
  saveNote,
  today,
  type NoteFields,
} from '@/lib/learner';

const FIELDS: { key: Exclude<keyof NoteFields, 'review'>; label: string; rows: number }[] = [
  { key: 'setup', label: 'Equipment, firmware, scope and recovery', rows: 3 },
  { key: 'prediction', label: 'My prediction and why', rows: 3 },
  { key: 'observation', label: 'What I observed (including failures)', rows: 4 },
  { key: 'explanation', label: 'My explanation, limits, and next experiment', rows: 4 },
];
const empty: NoteFields = { setup: '', prediction: '', observation: '', explanation: '', review: '' };
const textarea =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function initialModule() {
  const requested = new URLSearchParams(location.search).get('module');
  return modules.some((m) => m.id === requested) ? requested! : modules[0].id;
}

/** Learning notebook with spaced-review queue and JSON backup/restore (legacy notebook.html). Render with client:only. */
export default function NotebookIsland({ titles }: { titles: Record<string, string> }) {
  const notes = useStore($notes);
  const [moduleId, setModuleId] = useState(initialModule);
  const [form, setForm] = useState<NoteFields>(empty);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const [backupStatus, setBackupStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const mod = modules.find((m) => m.id === moduleId)!;

  function load(id: string) {
    const note = $notes.get()[id];
    setForm(note ? { setup: note.setup, prediction: note.prediction, observation: note.observation, explanation: note.explanation, review: note.review } : empty);
    setStatus(
      note?.updated
        ? `Last saved: ${new Date(note.updated).toLocaleString()}${note.retrieved ? `. Explained without notes: ${note.retrieved}` : ''}`
        : 'No saved entry for this module yet.',
    );
    setDirty(false);
  }

  useEffect(() => load(moduleId), [moduleId]);

  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  function switchModule(id: string) {
    if (dirty && !confirm('Discard unsaved edits and switch modules?')) return;
    setModuleId(id);
    history.replaceState(null, '', `?module=${id}`);
  }

  function save(retrieved: boolean) {
    const stored = saveNote(moduleId, form, retrieved);
    setDirty(!stored);
    setStatus(
      stored
        ? `${retrieved ? 'Retrieval recorded.' : 'Entry saved.'} Export a backup to keep a separate copy.`
        : 'Kept in this tab, but browser storage failed. Download a backup before you leave.',
    );
  }

  function exportBackup() {
    if (dirty) save(false);
    const blob = new Blob([JSON.stringify(createBackup($learner.get()), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFilename();
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupStatus('Backup download requested. Keep the file private.');
  }

  async function importBackup(file: File | undefined) {
    if (!file) return;
    try {
      const restored = parseBackup(await file.text(), file.size);
      if (!confirm('Replace the progress, atlas and notebook in this browser with this backup? Download a backup first if you need one.')) {
        setBackupStatus('Restore cancelled. Your data was not changed.');
        return;
      }
      const stored = applyBackup(restored);
      load(moduleId);
      setBackupStatus(stored ? 'Backup restored.' : 'Restored in this tab only. Browser storage failed, so keep your backup file.');
    } catch (e) {
      setBackupStatus(e instanceof BackupError ? e.message : 'This file is not a valid Signal Path backup. Your data was not changed.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const queue = useMemo(() => {
    const t = today();
    return modules
      .filter((m) => notes[m.id])
      .sort((a, b) => (notes[a.id].review || '9999').localeCompare(notes[b.id].review || '9999'))
      .map((m) => {
        const r = notes[m.id].review;
        return { m, label: r ? `${r <= t ? 'Review due' : 'Review'}: ${r}` : 'No review date' };
      });
  }, [notes]);

  return (
    <div className="space-y-12">
      <form
        className="space-y-5 rounded-card border border-border bg-card p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
        aria-labelledby="notebook-title"
      >
        <h2 id="notebook-title" className="m-0 text-xl">
          Entry
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="note-module">Module</Label>
            <select
              id="note-module"
              value={moduleId}
              onChange={(e) => switchModule(e.target.value)}
              className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-ellipsis"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.n} · {titles[m.id]}
                </option>
              ))}
            </select>
          </div>
          <a href={mod.href} className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">
            Open the lesson
          </a>
        </div>
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label htmlFor={`note-${f.key}`}>{f.label}</Label>
            <textarea
              id={`note-${f.key}`}
              rows={f.rows}
              maxLength={6000}
              value={form[f.key]}
              onChange={(e) => {
                setForm({ ...form, [f.key]: e.target.value });
                setDirty(true);
              }}
              className={textarea}
            />
          </div>
        ))}
        <div className="grid gap-1.5">
          <Label htmlFor="note-review">Review date</Label>
          <Input
            id="note-review"
            type="date"
            value={form.review}
            onChange={(e) => {
              setForm({ ...form, review: e.target.value });
              setDirty(true);
            }}
            aria-describedby="note-review-help"
            className="h-11 w-48"
          />
          <p id="note-review-help" className="m-0 text-sm text-muted-foreground">
            Choose tomorrow for the first check. After each review, move the date further out. Leave it blank for no review.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Save entry</Button>
          <Button type="button" variant="outline" onClick={() => save(true)}>
            I explained it without notes
          </Button>
        </div>
        <p role="status" aria-live="polite" className="m-0 text-sm text-muted-foreground">
          {status}
        </p>
      </form>

      <section id="review" aria-labelledby="review-title" className="scroll-mt-24">
        <h2 id="review-title" className="text-xl">
          Review queue
        </h2>
        <div className="mt-4 rounded-card border border-border bg-card p-5">
          {queue.length ? (
            <ul className="m-0 space-y-2 p-0">
              {queue.map(({ m, label }) => (
                <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2">
                  <button type="button" className="text-left font-medium text-primary hover:underline" onClick={() => switchModule(m.id)}>
                    {m.n} · {titles[m.id]}
                  </button>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-muted-foreground">No saved entries yet. Start with one prediction.</p>
          )}
        </div>
      </section>

      <section id="backup" aria-labelledby="backup-title" className="scroll-mt-24">
        <h2 id="backup-title" className="text-xl">
          Backup and restore
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your notebook, progress and atlas live in this browser. Download a backup file to keep a copy or move to another device. Files from the old Signal Path site work too.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={exportBackup}>
            Download backup
          </Button>
          <Label htmlFor="import-backup" className="sr-only">
            Restore from a backup file
          </Label>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            Restore from a file
          </Button>
          <input
            id="import-backup"
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => importBackup(e.target.files?.[0])}
          />
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          {backupStatus}
        </p>
      </section>
    </div>
  );
}
