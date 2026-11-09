import { Component, computed } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AppDialog } from './app-dialog';

/** Vilken sorts meddelande dialogen visar. Styr ikon och färg. */
export type DialogTyp = 'info' | 'lyckat' | 'varning' | 'fel';

/** Det som visas i dialogen. Öppnas med DialogService.showMessage(). */
export interface MeddelandeDialogData {
  typ: DialogTyp;
  rubrik: string;
  meddelande: string;
  /** Teknisk information i liten text, t.ex. "HTTP 500 · POST /api/arenden". */
  detaljer?: string;
  /** Text på knappen som stänger dialogen. Standard: "Stäng". */
  knapp?: string;
}

/** Ikon per typ, från ikonfonten Material Symbols. */
const IKONER: Record<DialogTyp, string> = {
  info: 'info',
  lyckat: 'check_circle',
  varning: 'warning',
  fel: 'error',
};

/** Färdig dialog för meddelanden av olika typ. Visas med DialogService.showMessage(). */
@Component({
  selector: 'app-meddelande-dialog',
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MatIcon],
  templateUrl: './meddelande-dialog.html',
  styleUrl: './meddelande-dialog.scss',
})
export class MeddelandeDialog extends AppDialog<MeddelandeDialogData> {
  protected readonly ikon = computed(() => IKONER[this.data.typ]);
}
