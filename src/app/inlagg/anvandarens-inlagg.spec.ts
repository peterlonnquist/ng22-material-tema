import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AnvandarensInlagg } from './anvandarens-inlagg';
import { InlaggService, JSONPLACEHOLDER_URL } from './inlagg.service';

describe('AnvandarensInlagg', () => {
  // InlaggService och httpResource körs på riktigt mot en falsk backend
  // (HttpTestingController). Material-komponenterna mockas.
  beforeEach(() =>
    MockBuilder(AnvandarensInlagg)
      .keep(InlaggService)
      .provide(provideHttpClient())
      .provide(provideHttpClientTesting()),
  );

  /** Renderar med anvandarId som input, som routern gör från URL:en. */
  async function visa(anvandarId: string) {
    const fixture = MockRender(AnvandarensInlagg, { anvandarId });
    const http = TestBed.inject(HttpTestingController);
    // Ändringsdetektering och resurser, utan att vänta på obesvarade anrop
    const uppdatera = async () => {
      TestBed.tick();
      await Promise.resolve();
      fixture.detectChanges();
    };
    await uppdatera();
    const text = (sel: string) => ngMocks.findAll(sel).map((el) => ngMocks.formatText(el));
    return { fixture, http, text, uppdatera };
  }

  it('hämtar och visar inläggen för användaren i URL:en, med antal ord', async () => {
    const { fixture, http, text } = await visa('2');

    expect(ngMocks.find('mat-progress-bar', null)).not.toBeNull();
    http.expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=2`).flush([
      { id: 11, userId: 2, title: 'et ea vero quia', body: 'delectus reiciendis' },
      { id: 12, userId: 2, title: 'in quibusdam', body: 'itaque id aut' },
    ]);
    await fixture.whenStable();

    expect(text('mat-card-title')).toEqual(['et ea vero quia', 'in quibusdam']);
    expect(text('mat-card-subtitle')).toEqual(['2 ord', '3 ord']);
    expect(ngMocks.find('mat-progress-bar', null)).toBeNull();
  });

  it('hämtar på nytt när id i URL:en ändras', async () => {
    const { fixture, http, text, uppdatera } = await visa('1');
    const forsta = http.expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=1`);

    // Som när routern återanvänder komponenten för /inlagg/5
    fixture.componentInstance.anvandarId = '5';
    await uppdatera();

    expect(forsta.cancelled).toBe(true);
    http
      .expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=5`)
      .flush([{ id: 41, userId: 5, title: 'non est facere', body: 'molestias id nostrum' }]);
    await fixture.whenStable();

    expect(text('mat-card-title')).toEqual(['non est facere']);
  });

  it('visar ett fel och hämtar igen med "Försök igen"', async () => {
    const { fixture, http, text, uppdatera } = await visa('1');
    http
      .expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=1`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    expect(text('.fel p')).toEqual(['Kunde inte hämta inläggen.']);

    ngMocks.click(ngMocks.find('.fel button'));
    await uppdatera();
    http
      .expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=1`)
      .flush([{ id: 1, userId: 1, title: 'sunt aut facere', body: 'quia et suscipit' }]);
    await fixture.whenStable();

    expect(text('.fel p')).toEqual([]);
    expect(text('mat-card-title')).toEqual(['sunt aut facere']);
  });
});
