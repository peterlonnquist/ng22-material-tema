import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MockBuilder } from 'ng-mocks';
import { Subject } from 'rxjs';
import { expectTypeOf } from 'vitest';
import { BekraftaDialog } from './bekrafta-dialog';
import { DialogService } from './dialog.service';
import { MeddelandeDialog, MeddelandeDialogData } from './meddelande-dialog';

const FEL: MeddelandeDialogData = {
  typ: 'fel',
  rubrik: 'Något gick fel',
  meddelande: 'Försök igen.',
};
const FRAGA = { rubrik: 'Ta bort?', fraga: 'Det går inte att ångra.' };

describe('DialogService', () => {
  // MatDialog mockas. Varje open() ger en dialog som testet stänger med stang().
  let stangda: Subject<unknown>[];

  beforeEach(() => {
    stangda = [];
    return MockBuilder(DialogService).mock(MatDialog, {
      open: vi.fn(() => {
        const stangd = new Subject<unknown>();
        stangda.push(stangd);
        return { afterClosed: () => stangd };
      }) as unknown as MatDialog['open'],
    });
  });

  /** Stänger dialog nummer i med ett resultat, som när användaren trycker på en knapp. */
  const stang = (i: number, resultat?: unknown) => {
    stangda[i].next(resultat);
    stangda[i].complete();
  };

  /** Låter promise-kedjorna i tjänsten köra klart. */
  const vanta = async () => {
    for (let i = 0; i < 3; i++) await Promise.resolve();
  };

  describe('show', () => {
    it('öppnar komponenten med data och inställningar och ger resultatet', async () => {
      const svar = TestBed.inject(DialogService).show(BekraftaDialog, FRAGA, { width: '300px' });

      expect(TestBed.inject(MatDialog).open).toHaveBeenCalledWith(BekraftaDialog, {
        width: '300px',
        data: FRAGA,
      });
      stang(0, true);
      expect(await svar).toBe(true);
    });

    it('ger undefined när dialogen stängs utan svar', async () => {
      const svar = TestBed.inject(DialogService).show(BekraftaDialog, FRAGA);

      stang(0); // Escape eller klick utanför

      expect(await svar).toBeUndefined();
    });

    it('kräver rätt data och ger rätt resultattyp för komponenten', () => {
      const service = TestBed.inject(DialogService);

      // Resultatet får typen som BekraftaDialog stänger med
      expectTypeOf(service.show(BekraftaDialog, FRAGA)).toEqualTypeOf<
        Promise<boolean | undefined>
      >();
      expectTypeOf(service.show(MeddelandeDialog, FEL)).toEqualTypeOf<Promise<void | undefined>>();

      // @ts-expect-error data saknas, BekraftaDialog kräver rubrik och fråga
      void service.show(BekraftaDialog);
      // @ts-expect-error fel data för BekraftaDialog
      void service.show(BekraftaDialog, { meddelande: 'fel form' });
    });
  });

  describe('showMessage', () => {
    it('öppnar MeddelandeDialog med data, bredd och roll efter typ', () => {
      const service = TestBed.inject(DialogService);

      void service.showMessage(FEL);
      void service.showMessage({ typ: 'info', rubrik: 'Tips', meddelande: 'Bra att veta.' });

      const open = TestBed.inject(MatDialog).open;
      expect(open).toHaveBeenCalledWith(MeddelandeDialog, {
        width: '420px',
        role: 'alertdialog',
        data: FEL,
      });
      expect(open).toHaveBeenLastCalledWith(
        MeddelandeDialog,
        expect.objectContaining({ role: 'dialog' }),
      );
    });

    it('visar bara en dialog av samma typ åt gången, men olika typer samtidigt', async () => {
      const service = TestBed.inject(DialogService);
      const open = TestBed.inject(MatDialog).open;

      void service.showMessage(FEL);
      void service.showMessage({ ...FEL, rubrik: 'Ett fel till' });
      void service.showMessage({ typ: 'lyckat', rubrik: 'Sparat', meddelande: 'Klart.' });
      expect(open).toHaveBeenCalledTimes(2); // ett fel och ett lyckat

      // När feldialogen har stängts kan en ny visas
      stang(0);
      await vanta();
      void service.showMessage(FEL);

      expect(open).toHaveBeenCalledTimes(3);
    });
  });
});
