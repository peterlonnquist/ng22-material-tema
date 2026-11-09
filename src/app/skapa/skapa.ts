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
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ArendeService } from '../arende/arende.service';
import { BekraftaDialog } from '../dialog/bekrafta-dialog';
import { DialogService } from '../dialog/dialog.service';
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
    MatProgressSpinner,
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
  private readonly dialog = inject(DialogService);

  protected readonly kategorier = KATEGORIER;
  protected readonly prioriteter = PRIORITETER;
  protected readonly miljoer = MILJOER;
  protected readonly forstaDatum = idag();

  /** Formulärets data. Signal Forms läser och skriver direkt i denna signal. */
  protected readonly arende = signal<NyttArende>({ ...TOMT_ARENDE });

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
      // Medan action körs är submitting() sann: Skapa-knappen visar en spinner,
      // och nya försök att skicka ignoreras av Signal Forms, så man kan inte
      // skapa samma ärende två gånger.
      submission: {
        action: async () => {
          try {
            const arende = await this.arendeService.skapa(this.arende());
            this.snackBar.open(`Ärendet "${arende.titel}" har skapats`, 'Stäng', {
              duration: 4000,
            });
            // Navigera först när sparningen har lyckats
            await this.router.navigate(['/arenden', arende.id]);
          } catch {
            // Felet har redan visats i en dialog av httpFelInterceptor. Stanna
            // kvar med det ifyllda formuläret så att man kan försöka igen.
          }
          return undefined;
        },
      },
    },
  );

  /** Rensar formuläret. Har man fyllt i något frågar en dialog först. */
  protected async rensa(): Promise<void> {
    if (this.arendeForm().dirty()) {
      const ja = await this.dialog.show(BekraftaDialog, {
        rubrik: 'Rensa formuläret?',
        fraga: 'Det du har fyllt i försvinner.',
        ja: 'Rensa',
      });
      if (!ja) {
        return;
      }
    }
    this.arendeForm().reset({ ...TOMT_ARENDE });
  }
}
