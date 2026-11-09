import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { AppDialog } from './app-dialog';

export interface BekraftaDialogData {
  rubrik: string;
  fraga: string;
  /** Text på knappen som bekräftar. Standard: "OK". */
  ja?: string;
  /** Text på knappen som avbryter. Standard: "Avbryt". */
  nej?: string;
}

/**
 * Exempel på en egen dialog med resultat: stänger med true eller false.
 *
 *   if (await dialog.show(BekraftaDialog, { rubrik: 'Ta bort?', fraga: '...' })) { ... }
 */
@Component({
  selector: 'app-bekrafta-dialog',
  imports: [MatButton, MatDialogActions, MatDialogContent, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>{{ data.rubrik }}</h2>
    <mat-dialog-content>
      <p>{{ data.fraga }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <!-- Avbryt får fokus: Enter ska inte av misstag göra något som inte går att ångra -->
      <button matButton (click)="close(false)" cdkFocusInitial>{{ data.nej ?? 'Avbryt' }}</button>
      <button matButton="filled" (click)="close(true)">{{ data.ja ?? 'OK' }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    p {
      margin: 0;
    }
  `,
})
export class BekraftaDialog extends AppDialog<BekraftaDialogData, boolean> {}
