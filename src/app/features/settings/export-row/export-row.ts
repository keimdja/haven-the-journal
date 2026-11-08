import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { EntriesRepo } from '../../../core/data/entries-repo';
import { exportFileName, exportJson, exportMarkdown } from '../../../core/data/export';
import { FileDownload } from '../../../core/data/file-download';
import type { Entry } from '../../../core/data/models';
import { Sync } from '../../../core/data/sync';
import { I18n } from '../../../core/i18n/i18n';
import { SettingsRow } from '../../../shared/ui/settings-row/settings-row';

/**
 * Export journal. It syncs first, so a device that hasn't caught up doesn't
 * export a partial journal; if that fails it exports anyway and says so. The
 * complete JSON comes first, then a readable copy is one more tap away.
 */
@Component({
  selector: 'app-export-row',
  imports: [SettingsRow],
  templateUrl: './export-row.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportRow {
  private readonly repo = inject(EntriesRepo);
  private readonly sync = inject(Sync);
  private readonly files = inject(FileDownload);
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly busy = signal(false);
  protected readonly result = signal<'complete' | 'local' | null>(null);
  private exported: Entry[] = [];

  protected async start(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.result.set(null);
    try {
      await this.sync.run();
      const synced = this.sync.state() === 'saved';
      this.exported = await this.repo.allNow();
      this.files.save(exportFileName('json'), exportJson(this.exported), 'application/json');
      this.result.set(synced ? 'complete' : 'local');
    } finally {
      this.busy.set(false);
    }
  }

  protected downloadReadable(): void {
    const text = exportMarkdown(this.exported, this.t(), this.i18n.locale());
    this.files.save(exportFileName('md'), text, 'text/markdown');
  }
}
