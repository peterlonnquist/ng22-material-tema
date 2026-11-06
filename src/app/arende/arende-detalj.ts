import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { KATEGORIER, MILJOER, PRIORITETER } from '../skapa/skapa.model';
import { ArendeService } from './arende.service';

/** Slår upp visningstexten för ett värde, t.ex. 'forbattring' → 'Förbättring'. */
function text(lista: { varde: string; text: string }[], varde: string): string {
  return lista.find((v) => v.varde === varde)?.text ?? varde;
}

/** Detaljsidan för ett ärende, /arenden/:id. Hit kommer man efter att ha skapat ett. */
@Component({
  selector: 'app-arende-detalj',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    RouterLink,
  ],
  templateUrl: './arende-detalj.html',
  styleUrl: './arende-detalj.scss',
})
export class ArendeDetalj {
  private readonly arendeService = inject(ArendeService);

  /** Fylls från :id i URL:en via withComponentInputBinding() i app.config.ts. */
  readonly id = input.required<string>();

  protected readonly arende = computed(() => this.arendeService.hamta(this.id()));

  protected readonly kategori = computed(() => text(KATEGORIER, this.arende()?.kategori ?? ''));
  protected readonly prioritet = computed(() => text(PRIORITETER, this.arende()?.prioritet ?? ''));
  protected readonly miljo = computed(() => text(MILJOER, this.arende()?.miljo ?? ''));

  protected datum(d: Date | null): string {
    return d ? d.toLocaleDateString('sv-SE') : '–';
  }
}
