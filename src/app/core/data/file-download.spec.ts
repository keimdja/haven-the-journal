import { TestBed } from '@angular/core/testing';

import { FileDownload } from './file-download';

describe('FileDownload', () => {
  it('offers the text as a named file and cleans up after', () => {
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => 'blob:haven');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('haven.json');
      expect(this.href).toBe('blob:haven');
    });

    TestBed.inject(FileDownload).save('haven.json', '{}', 'application/json');

    expect(click).toHaveBeenCalled();
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/json');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:haven');
    click.mockRestore();
  });
});
