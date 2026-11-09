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
  templateUrl: './bekrafta-dialog.html',
  styleUrl: './bekrafta-dialog.scss',
})
export class BekraftaDialog extends AppDialog<BekraftaDialogData, boolean> {}
