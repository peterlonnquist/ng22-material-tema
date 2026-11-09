import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { MeddelandeDialog, MeddelandeDialogData } from './meddelande-dialog';

describe('MeddelandeDialog', () => {
  /** Renderar dialogen med data, som MatDialog gör. */
  async function visa(data: MeddelandeDialogData) {
    await MockBuilder(MeddelandeDialog)
      .provide({ provide: MAT_DIALOG_DATA, useValue: data })
      .provide({ provide: MatDialogRef, useValue: { close: vi.fn() } });
    MockRender(MeddelandeDialog);
    const text = (sel: string) => ngMocks.findAll(sel).map((el) => ngMocks.formatText(el));
    return { text };
  }

  it('visar rubrik, meddelande, detaljer och ikon för fel', async () => {
    const { text } = await visa({
      typ: 'fel',
      rubrik: 'Något gick fel',
      meddelande: 'Ett oväntat fel uppstod.',
      detaljer: 'HTTP 500 · POST /api/arenden',
    });

    expect(text('mat-icon')).toEqual(['error']);
    expect(ngMocks.find('mat-icon').classes['fel']).toBe(true);
    expect(text('h2')).toEqual(['error Något gick fel']);
    expect(text('p')).toEqual(['Ett oväntat fel uppstod.', 'HTTP 500 · POST /api/arenden']);
    expect(text('button')).toEqual(['Stäng']);
  });

  it('har ikon och färg efter typ, och egen knapptext', async () => {
    const { text } = await visa({
      typ: 'lyckat',
      rubrik: 'Sparat',
      meddelande: 'Ärendet har sparats.',
      knapp: 'OK',
    });

    expect(text('mat-icon')).toEqual(['check_circle']);
    expect(ngMocks.find('mat-icon').classes['lyckat']).toBe(true);
    expect(text('p')).toEqual(['Ärendet har sparats.']); // inga detaljer
    expect(text('button')).toEqual(['OK']);
  });
});
