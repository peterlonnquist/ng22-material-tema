import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FelDialog, FelDialogData } from './fel-dialog';

describe('FelDialog', () => {
  const data: FelDialogData = {
    rubrik: 'Något gick fel',
    meddelande: 'Ett oväntat fel uppstod.',
    detaljer: 'HTTP 500 · POST /api/arenden',
  };

  beforeEach(() => MockBuilder(FelDialog).provide({ provide: MAT_DIALOG_DATA, useValue: data }));

  it('visar rubrik, meddelande och detaljer', () => {
    MockRender(FelDialog);

    expect(ngMocks.formatText(ngMocks.find('h2'))).toBe('Något gick fel');
    expect(ngMocks.findAll('p').map((p) => ngMocks.formatText(p))).toEqual([
      'Ett oväntat fel uppstod.',
      'HTTP 500 · POST /api/arenden',
    ]);
    expect(ngMocks.formatText(ngMocks.find('button'))).toBe('Stäng');
  });
});
