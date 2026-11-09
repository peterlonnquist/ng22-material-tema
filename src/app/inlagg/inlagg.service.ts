import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Anvandare, Inlagg, InlaggVy, NyttInlagg } from './inlagg.model';

export const JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com';

/** Lägger till antal ord på ett inlägg från API:t. */
function tillVy(inlagg: Inlagg): InlaggVy {
  return { ...inlagg, antalOrd: inlagg.body.split(/\s+/).length };
}

/**
 * Användare och inlägg från JSONPlaceholder.
 *
 * Läsning görs med httpResource: anvandare() och inlagg() skapar en resurs
 * och måste därför anropas i ett injektionssammanhang, t.ex. som
 * fältinitierare i en komponent. Resursen lever då lika länge som
 * komponenten och avbryts när den förstörs.
 *
 * Skrivning görs med HttpClient: skapa(). httpResource är till för att läsa.
 * En resurs hämtar på nytt och avbryter pågående anrop när parametrarna
 * ändras, och det vill man inte att en sparning gör.
 */
@Injectable({ providedIn: 'root' })
export class InlaggService {
  private readonly http = inject(HttpClient);

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
        parse: (svar) => (svar as Inlagg[]).map(tillVy),
      },
    );
  }

  /**
   * Skapar ett inlägg: POST /posts. Returnerar inlägget med id från servern
   * och antal ord, i samma form som inlagg() ger.
   *
   * JSONPlaceholder sparar inte på riktigt: svaret har alltid id 101 och
   * inlägget syns inte i senare GET-anrop.
   */
  async skapa(nytt: NyttInlagg): Promise<InlaggVy> {
    const inlagg = await firstValueFrom(
      this.http.post<Inlagg>(`${JSONPLACEHOLDER_URL}/posts`, nytt),
    );
    return tillVy(inlagg);
  }
}
