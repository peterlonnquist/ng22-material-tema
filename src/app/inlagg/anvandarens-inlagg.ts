import { Component, inject, input, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InlaggService } from './inlagg.service';

const TOMT_INLAGG = { titel: '', text: '' };

/** En användares inlägg, /inlagg/:anvandarId. Visas i InlaggSidas router-outlet. */
@Component({
  selector: 'app-anvandarens-inlagg',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatProgressBar,
    MatProgressSpinner,
  ],
  templateUrl: './anvandarens-inlagg.html',
  styleUrl: './anvandarens-inlagg.scss',
})
export class AnvandarensInlagg {
  private readonly inlaggService = inject(InlaggService);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Från :anvandarId i URL:en, via withComponentInputBinding() i app.config.ts.
   * Inputs är signaler, så den kan skickas rakt in i tjänsten. Byter man
   * användare återanvänds komponenten, input ändras och inläggen hämtas igen.
   */
  readonly anvandarId = input.required<string>();

  protected readonly inlagg = this.inlaggService.inlagg(this.anvandarId);

  /** Formuläret för ett nytt inlägg. */
  protected readonly nytt = signal({ ...TOMT_INLAGG });

  protected readonly nyttForm = form(
    this.nytt,
    (falt) => {
      required(falt.titel, { message: 'Ange en titel' });
      maxLength(falt.titel, 100, { message: 'Högst 100 tecken' });
      required(falt.text, { message: 'Skriv något' });
    },
    {
      submission: {
        action: async () => {
          const { titel, text } = this.nytt();
          try {
            const skapat = await this.inlaggService.skapa({
              userId: Number(this.anvandarId()),
              title: titel,
              body: text,
            });
            // Lägg till det nya inlägget först i listan direkt, utan att hämta
            // om (JSONPlaceholder sparar inte, så det skulle ändå inte synas).
            // Resursens värde blir då lokalt ändrat, status 'local'.
            this.inlagg.update((lista) => [skapat, ...lista]);
            this.snackBar.open('Inlägget har publicerats', 'Stäng', { duration: 4000 });
            this.nyttForm().reset({ ...TOMT_INLAGG });
          } catch {
            // Den globala feldialogen gäller bara /api/, så felet visas här.
            // Det ifyllda finns kvar så att man kan försöka igen.
            this.snackBar.open('Kunde inte publicera inlägget, försök igen', 'Stäng', {
              duration: 6000,
            });
          }
          return undefined;
        },
      },
    },
  );
}
