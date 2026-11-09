import { inject, Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppDialog, DialogData, DialogResult } from './app-dialog';
import { DialogTyp, MeddelandeDialog, MeddelandeDialogData } from './meddelande-dialog';

/** Inställningar till MatDialog, utom data som skickas separat. */
export type DialogConfig = Omit<MatDialogConfig, 'data'>;

/** Dialoger utan data (AppDialog<void>) kan visas utan att skicka in något. */
type ShowArgs<C> = [DialogData<C>] extends [void | undefined]
  ? [data?: DialogData<C>, config?: DialogConfig]
  : [data: DialogData<C>, config?: DialogConfig];

/**
 * Visar dialoger i appen. Komponenter och interceptorer anropar den här i
 * stället för MatDialog direkt.
 *
 *   // Egen dialog: komponenten ärver AppDialog<Data, Resultat>
 *   const ja = await this.dialog.show(BekraftaDialog, { rubrik: '...', fraga: '...' });
 *
 *   // Färdig meddelandedialog med typ
 *   this.dialog.showMessage({ typ: 'lyckat', rubrik: 'Sparat', meddelande: '...' });
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

  /** Öppna meddelandedialoger per typ, för att inte stapla flera av samma sort. */
  private readonly oppnaMeddelanden = new Map<DialogTyp, Promise<void>>();

  /**
   * Visar en egen dialogkomponent. Datan måste ha den typ komponenten kräver,
   * och resultatet får den typ komponenten stänger med. Blir undefined om
   * dialogen stängs utan svar (Escape, klick utanför).
   */
  show<C extends AppDialog<unknown, unknown>>(
    component: Type<C>,
    ...[data, config]: ShowArgs<C>
  ): Promise<DialogResult<C> | undefined> {
    const ref = this.dialog.open<C, DialogData<C>, DialogResult<C>>(component, {
      ...config,
      data,
    });
    return firstValueFrom(ref.afterClosed());
  }

  /**
   * Visar ett meddelande av en viss typ (info, lyckat, varning, fel).
   *
   * Är en dialog av samma typ redan öppen visas ingen ny, t.ex. när flera
   * anrop misslyckas samtidigt. Promiset gäller då den som redan är öppen.
   */
  showMessage(data: MeddelandeDialogData): Promise<void> {
    const oppen = this.oppnaMeddelanden.get(data.typ);
    if (oppen) {
      return oppen;
    }
    const stangd = this.show(MeddelandeDialog, data, {
      width: '420px',
      // Fel och varningar kräver uppmärksamhet, skärmläsare läser upp dem direkt
      role: data.typ === 'fel' || data.typ === 'varning' ? 'alertdialog' : 'dialog',
    }).then(() => {
      this.oppnaMeddelanden.delete(data.typ);
    });
    this.oppnaMeddelanden.set(data.typ, stangd);
    return stangd;
  }
}
