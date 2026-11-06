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
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
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
    MatCardHeader,
    MatCardTitle,
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

  protected readonly kategorier = KATEGORIER;
  protected readonly prioriteter = PRIORITETER;
  protected readonly miljoer = MILJOER;
  protected readonly forstaDatum = idag();

  /** Formulärets data. Signal Forms läser och skriver direkt i denna signal. */
  protected readonly arende = signal<NyttArende>({ ...TOMT_ARENDE });

  /** Senast skapade ärende, visas som kvitto under formuläret. */
  protected readonly skapat = signal<NyttArende | null>(null);

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
      submission: {
        action: async () => {
          await this.sparaArende(this.arende());
          return undefined;
        },
      },
    },
  );

  /** Fejkad sparning, byt mot ett riktigt API-anrop. */
  private async sparaArende(arende: NyttArende): Promise<void> {
    await new Promise((klar) => setTimeout(klar, 600));
    this.skapat.set(arende);
    this.snackBar.open(`Ärendet "${arende.titel}" har skapats`, 'Stäng', { duration: 4000 });
    this.rensa();
  }

  protected rensa(): void {
    this.arendeForm().reset({ ...TOMT_ARENDE });
  }
}
