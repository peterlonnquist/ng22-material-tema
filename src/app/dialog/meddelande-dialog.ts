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
  template: `
    <h2 mat-dialog-title>
      <mat-icon aria-hidden="true" [class]="data.typ">{{ ikon() }}</mat-icon>
      {{ data.rubrik }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.meddelande }}</p>
      @if (data.detaljer) {
        <p class="detaljer">{{ data.detaljer }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton="filled" mat-dialog-close cdkFocusInitial>
        {{ data.knapp ?? 'Stäng' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    // M3 har ingen egen färg för varning och lyckat, så tertiary och primary används
    .info {
      color: var(--mat-sys-on-surface-variant);
    }
    .lyckat {
      color: var(--mat-sys-primary);
    }
    .varning {
      color: var(--mat-sys-tertiary);
    }
    .fel {
      color: var(--mat-sys-error);
    }
    p {
      margin: 0;
    }
    .detaljer {
      margin-top: 12px;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class MeddelandeDialog extends AppDialog<MeddelandeDialogData> {
  protected readonly ikon = computed(() => IKONER[this.data.typ]);
}
