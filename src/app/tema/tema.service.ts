import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type TemaLage = 'system' | 'ljust' | 'morkt';

// Läses även av inline-scriptet i src/index.html – ändra på båda ställena.
const LAGRINGSNYCKEL = 'tema-lage';

/** Styr ljust/mörkt läge genom att sätta en klass på <html>. */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly dokument = inject(DOCUMENT);

  readonly lage = signal<TemaLage>(this.lasSparatLage());

  constructor() {
    effect(() => {
      const lage = this.lage();
      const rot = this.dokument.documentElement.classList;
      rot.toggle('ljust-tema', lage === 'ljust');
      rot.toggle('morkt-tema', lage === 'morkt');
      try {
        localStorage.setItem(LAGRINGSNYCKEL, lage);
      } catch {
        // localStorage kan saknas (t.ex. SSR eller privat läge)
      }
    });
  }

  private lasSparatLage(): TemaLage {
    try {
      const sparat = localStorage.getItem(LAGRINGSNYCKEL);
      if (sparat === 'ljust' || sparat === 'morkt' || sparat === 'system') {
        return sparat;
      }
    } catch {
      // ignorera
    }
    return 'system';
  }
}
