import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { Anvandare, Inlagg, InlaggVy } from './inlagg.model';

export const JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Hämtar användare och inlägg från JSONPlaceholder med httpResource.
 *
 * Metoderna skapar en resurs och måste därför anropas i ett
 * injektionssammanhang, t.ex. som fältinitierare i en komponent. Resursen
 * lever då lika länge som komponenten och avbryts när den förstörs.
 */
@Injectable({ providedIn: 'root' })
export class InlaggService {
  /** Alla användare. Hämtas en gång, när resursen skapas. */
  anvandare() {
    return httpResource<Anvandare[]>(() => `${JSONPLACEHOLDER_URL}/users`, { defaultValue: [] });
  }

  /**
   * Inläggen för en användare: GET /posts?userId=3.
   *
   * Parametern är en signal, inte ett värde. httpResource läser den och
   * hämtar automatiskt på nytt när den ändras. Ett pågående anrop avbryts
   * då, så ett gammalt svar kan aldrig skriva över ett nyare.
   *
   * parse gör om svaret till InlaggVy, med antal ord tillagt.
   */
  inlagg(anvandarId: Signal<string>) {
    return httpResource<InlaggVy[]>(
      () => ({ url: `${JSONPLACEHOLDER_URL}/posts`, params: { userId: anvandarId() } }),
      {
        defaultValue: [],
        // Körs en gång per svar. Det som returneras här blir value().
        // Kastar parse ett fel hamnar resursen i felläge, precis som vid HTTP-fel.
        parse: (svar) =>
          (svar as Inlagg[]).map((inlagg) => ({
            ...inlagg,
            antalOrd: inlagg.body.split(/\s+/).length,
          })),
      },
    );
  }
}
