import { inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Basklass för dialoger som visas med DialogService.show().
 *
 *   D = datan dialogen får in, R = resultatet den stänger med.
 *
 *   export class MinDialog extends AppDialog<MinData, boolean> { ... }
 *   const svar = await dialog.show(MinDialog, minData);  // boolean | undefined
 *
 * I mallen finns data och close(resultat). Resultatet är undefined om
 * dialogen stängs utan svar, t.ex. med Escape eller klick utanför.
 */
export abstract class AppDialog<D = void, R = void> {
  /**
   * Finns bara för TypeScript, inte när appen körs. Gör att show() kan läsa
   * ut D och R ur komponentklassen och kräva rätt data.
   */
  declare readonly dialogTypes?: { data: D; result: R };

  protected readonly data = inject<D>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<AppDialog<D, R>, R>>(MatDialogRef);

  /** Stänger dialogen med ett resultat, som show() returnerar. */
  protected close(result?: R): void {
    this.ref.close(result);
  }
}

/** Datan som dialogkomponenten C tar emot. */
export type DialogData<C> = C extends { readonly dialogTypes?: { data: infer D } } ? D : never;

/** Resultatet som dialogkomponenten C stänger med. */
export type DialogResult<C> = C extends { readonly dialogTypes?: { result: infer R } } ? R : never;
