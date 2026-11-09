import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { InlaggSida } from './inlagg-sida';
import { InlaggService, JSONPLACEHOLDER_URL } from './inlagg.service';

describe('InlaggSida', () => {
  // Riktig router och HTTP mot en falsk backend. Material mockas.
  beforeEach(() =>
    MockBuilder(InlaggSida)
      .keep(InlaggService)
      .keep(RouterLink)
      .keep(RouterOutlet)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide(provideRouter([{ path: 'inlagg', component: InlaggSida }]))
      .provide(provideHttpClient())
      .provide(provideHttpClientTesting()),
  );

  it('visar användarna som länkar till /inlagg/:id och ett tips innan någon är vald', async () => {
    const fixture = MockRender(InlaggSida);
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne(`${JSONPLACEHOLDER_URL}/users`)
      .flush([
        { id: 1, name: 'Leanne Graham', email: 'a@example.com' },
        { id: 2, name: 'Ervin Howell', email: 'b@example.com' },
      ]);
    await fixture.whenStable();

    const lankar = ngMocks.findAll('nav a');
    expect(lankar.map((a) => ngMocks.formatText(a))).toEqual(['Leanne Graham', 'Ervin Howell']);
    // Relativa länkar, [routerLink]="[a.id]". Här renderas sidan utan route, så de
    // utgår från roten. I appen ligger sidan på /inlagg och länkarna blir /inlagg/1.
    expect(lankar.map((a) => a.attributes['href'])).toEqual(['/1', '/2']);
    expect(ngMocks.formatText(ngMocks.find('.tips'))).toBe(
      'Välj en användare för att se användarens inlägg.',
    );
  });
});
