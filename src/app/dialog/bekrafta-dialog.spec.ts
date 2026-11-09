import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { BekraftaDialog, BekraftaDialogData } from './bekrafta-dialog';

describe('BekraftaDialog', () => {
  /** Renderar dialogen med data och en falsk MatDialogRef, som MatDialog gör. */
  async function visa(data: BekraftaDialogData) {
    await MockBuilder(BekraftaDialog)
      .provide({ provide: MAT_DIALOG_DATA, useValue: data })
      .provide({ provide: MatDialogRef, useValue: { close: vi.fn() } });
    MockRender(BekraftaDialog);
    const knappar = () => ngMocks.findAll('button');
    return { knappar, ref: TestBed.inject(MatDialogRef) };
  }

  it('visar rubrik, fråga och knappar med standardtexter', async () => {
    const { knappar } = await visa({ rubrik: 'Ta bort?', fraga: 'Det går inte att ångra.' });

    expect(ngMocks.formatText(ngMocks.find('h2'))).toBe('Ta bort?');
    expect(ngMocks.formatText(ngMocks.find('p'))).toBe('Det går inte att ångra.');
    expect(knappar().map((k) => ngMocks.formatText(k))).toEqual(['Avbryt', 'OK']);
    // Avbryt får fokus när dialogen öppnas, inte knappen som bekräftar
    expect(knappar().map((k) => k.attributes['cdkFocusInitial'] !== undefined)).toEqual([
      true,
      false,
    ]);
  });

  it('stänger med true när man bekräftar och false när man avbryter', async () => {
    const { knappar, ref } = await visa({
      rubrik: 'Rensa?',
      fraga: '…',
      ja: 'Rensa',
      nej: 'Behåll',
    });
    expect(knappar().map((k) => ngMocks.formatText(k))).toEqual(['Behåll', 'Rensa']);

    ngMocks.click(knappar()[1]);
    expect(ref.close).toHaveBeenLastCalledWith(true);

    ngMocks.click(knappar()[0]);
    expect(ref.close).toHaveBeenLastCalledWith(false);
  });
});
