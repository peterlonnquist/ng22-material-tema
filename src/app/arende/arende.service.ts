import { Injectable, signal } from '@angular/core';
import { NyttArende } from '../skapa/skapa.model';
import { Arende } from './arende.model';

/**
 * Sparar och hämtar ärenden. Fejkad: ärendena ligger bara i minnet och
 * försvinner vid omladdning. Byt mot HttpClient-anrop mot ett riktigt API.
 */
@Injectable({ providedIn: 'root' })
export class ArendeService {
  private readonly arenden = signal<Arende[]>([]);
  private nastaId = 1;

  /** Sparar ett nytt ärende och returnerar det med id, som en server skulle göra. */
  async skapa(nytt: NyttArende): Promise<Arende> {
    await new Promise((klar) => setTimeout(klar, 600)); // låtsas nätverksfördröjning
    const arende: Arende = { ...nytt, id: String(this.nastaId++), skapad: new Date() };
    this.arenden.update((lista) => [...lista, arende]);
    return arende;
  }

  /** Hämtar ett ärende. Läser en signal, så anrop i computed() uppdateras automatiskt. */
  hamta(id: string): Arende | undefined {
    return this.arenden().find((a) => a.id === id);
  }
}
