import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/** Hands the browser a file to save, built from text already in memory. */
@Injectable({ providedIn: 'root' })
export class FileDownload {
  private readonly document = inject(DOCUMENT);

  save(fileName: string, contents: string, type: string): void {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
