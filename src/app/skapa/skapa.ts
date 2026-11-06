import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  minDate,
  minLength,
  required,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ArendeService } from '../arende/arende.service';
import { KATEGORIER, MILJOER, NyttArende, PRIORITETER, TOMT_ARENDE } from './skapa.model';

/** Dagens datum utan klockslag, så att idag räknas som giltig deadline. */
function idag(): Date {
  const nu = new Date();
  return new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
}

/** Skapa-sidan: formulär byggt med Angular Signal Forms och Material-komponenter. */
@Component({
  selector: 'app-skapa',
  // Enskilda komponenter och direktiv i stället för hela moduler. Då varnar
  // kompilatorn (NG8113) om något av dem inte längre används i mallen.
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatError,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
    MatOption,
    MatProgressBar,
    MatSelect,
    MatSuffix, // matTextSuffix och matIconSuffix
  ],
  templateUrl: './skapa.html',
  styleUrl: './skapa.scss',
})
export class Skapa {
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly arendeService = inject(ArendeService);

  protected readonly kategorier = KATEGORIER;
  protected readonly prioriteter = PRIORITETER;
  protected readonly miljoer = MILJOER;
  protected readonly forstaDatum = idag();

  /** Formulärets data. Signal Forms läser och skriver direkt i denna signal. */
  protected readonly arende = signal<NyttArende>({ ...TOMT_ARENDE });

  /** Felmeddelande om sparningen misslyckades, visas ovanför knapparna. */
  protected readonly sparfel = signal<string | null>(null);

  protected readonly arendeForm = form(
    this.arende,
    (falt) => {
      required(falt.titel, { message: 'Ange en titel' });
      minLength(falt.titel, 3, { message: 'Titeln måste vara minst 3 tecken' });
      maxLength(falt.beskrivning, 500, { message: 'Högst 500 tecken' });
      required(falt.kategori, { message: 'Välj en kategori' });
      required(falt.miljo, { message: 'Välj en miljö' });
      required(falt.kontakt, { message: 'Ange en e-postadress' });
      email(falt.kontakt, { message: 'Ange en giltig e-postadress' });
      min(falt.timmar, 1, { message: 'Minst 1 timme' });
      max(falt.timmar, 200, { message: 'Högst 200 timmar' });
      required(falt.deadline, { message: 'Välj ett datum' });
      minDate(falt.deadline, idag(), { message: 'Datumet kan inte ha passerat' });
    },
    {
      // Körs när formuläret skickas och är giltigt (via [formRoot] i mallen).
      // Är det ogiltigt markeras alla fält som touched så att felen visas.
      // Medan action körs är submitting() sann: förloppsindikatorn visas och
      // Skapa-knappen är avstängd, så man kan inte skapa samma ärende två gånger.
      submission: {
        action: async () => {
          this.sparfel.set(null);
          try {
            const arende = await this.arendeService.skapa(this.arende());
            this.snackBar.open(`Ärendet "${arende.titel}" har skapats`, 'Stäng', {
              duration: 4000,
            });
            // Navigera först när sparningen har lyckats
            await this.router.navigate(['/arenden', arende.id]);
          } catch {
            // Stanna kvar med det ifyllda formuläret så att man kan försöka igen.
            // Tillfälliga fel (nätverk, 500) returneras inte som valideringsfel:
            // sådana gör formuläret ogiltigt tills ett värde ändras, och då går
            // det inte att skicka samma data igen. Returnera fel från action bara
            // för serverns valideringsfel, t.ex.
            // { kind: 'upptagen', message: '...', fieldTree: this.arendeForm.kontakt }
            this.sparfel.set('Kunde inte spara ärendet, försök igen');
          }
          return undefined;
        },
      },
    },
  );

  protected rensa(): void {
    this.arendeForm().reset({ ...TOMT_ARENDE });
  }
}
