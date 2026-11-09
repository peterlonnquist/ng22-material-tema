import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { InlaggService } from './inlagg.service';

/** En användares inlägg, /inlagg/:anvandarId. Visas i InlaggSidas router-outlet. */
@Component({
  selector: 'app-anvandarens-inlagg',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatProgressBar,
  ],
  templateUrl: './anvandarens-inlagg.html',
  styleUrl: './anvandarens-inlagg.scss',
})
export class AnvandarensInlagg {
  /**
   * Från :anvandarId i URL:en, via withComponentInputBinding() i app.config.ts.
   * Inputs är signaler, så den kan skickas rakt in i tjänsten. Byter man
   * användare återanvänds komponenten, input ändras och inläggen hämtas igen.
   */
  readonly anvandarId = input.required<string>();

  protected readonly inlagg = inject(InlaggService).inlagg(this.anvandarId);
}
