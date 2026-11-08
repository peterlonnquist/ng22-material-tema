import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

/** Det som visas i feldialogen. */
export interface FelDialogData {
  rubrik: string;
  meddelande: string;
  /** Teknisk information, t.ex. "HTTP 500 · POST /api/arenden". */
  detaljer?: string;
}

/** Dialog för fel. Öppnas av httpFelInterceptor när ett API-anrop misslyckas. */
@Component({
  selector: 'app-fel-dialog',
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>{{ data.rubrik }}</h2>
    <mat-dialog-content>
      <p>{{ data.meddelande }}</p>
      @if (data.detaljer) {
        <p class="detaljer">{{ data.detaljer }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton="filled" mat-dialog-close cdkFocusInitial>Stäng</button>
    </mat-dialog-actions>
  `,
  styles: `
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
export class FelDialog {
  protected readonly data = inject<FelDialogData>(MAT_DIALOG_DATA);
}
