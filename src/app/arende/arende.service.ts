import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NyttArende } from '../skapa/skapa.model';
import { Arende } from './arende.model';

/**
 * Sparar och hämtar ärenden. Sparar via POST /api/arenden, som just nu
 * besvaras av fejkBackendInterceptor. Skapade ärenden sparas även i minnet
 * så att detaljsidan kan visa dem, och försvinner vid omladdning.
 *
 * Fel visas av httpFelInterceptor. Anroparen får felet som ett avvisat
 * Promise, men behöver inte visa något själv.
 */
@Injectable({ providedIn: 'root' })
export class ArendeService {
  private readonly http = inject(HttpClient);
  private readonly arenden = signal<Arende[]>([]);

  /** Sparar ett nytt ärende och returnerar det med id från servern. */
  async skapa(nytt: NyttArende): Promise<Arende> {
    const arende = await firstValueFrom(this.http.post<Arende>('/api/arenden', nytt));
    this.arenden.update((lista) => [...lista, arende]);
    return arende;
  }

  /** Hämtar ett ärende. Läser en signal, så anrop i computed() uppdateras automatiskt. */
  hamta(id: string): Arende | undefined {
    return this.arenden().find((a) => a.id === id);
  }
}
