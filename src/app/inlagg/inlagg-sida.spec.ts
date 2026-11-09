import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { fakeHttpResource, FakeHttpResource } from '../../testing/fake-http-resource';
import { InlaggSida } from './inlagg-sida';
import { Anvandare } from './inlagg.model';
import { InlaggService } from './inlagg.service';

describe('InlaggSida', () => {
  // InlaggService mockas: anvandare() ger en fejkad resurs som testet styr.
  // Routern är riktig för att kunna kontrollera länkarna.
  let anvandare: FakeHttpResource<Anvandare[]>;

  beforeEach(() => {
    anvandare = fakeHttpResource<Anvandare[]>([]);
    return MockBuilder(InlaggSida)
      .keep(RouterLink)
      .keep(RouterOutlet)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide(provideRouter([]))
      .mock(InlaggService, { anvandare: () => anvandare });
  });

  it('visar användarna som länkar och ett tips innan någon är vald', () => {
    const fixture = MockRender(InlaggSida);

    anvandare.resolve([
      { id: 1, name: 'Leanne Graham', email: 'a@example.com' },
      { id: 2, name: 'Ervin Howell', email: 'b@example.com' },
    ]);
    fixture.detectChanges();

    const lankar = ngMocks.findAll('nav a');
    expect(lankar.map((a) => ngMocks.formatText(a))).toEqual(['Leanne Graham', 'Ervin Howell']);
    // Relativa länkar, [routerLink]="[a.id]". Här renderas sidan utan route, så de
    // utgår från roten. I appen ligger sidan på /inlagg och länkarna blir /inlagg/1.
    expect(lankar.map((a) => a.attributes['href'])).toEqual(['/1', '/2']);
    expect(ngMocks.formatText(ngMocks.find('.tips'))).toBe(
      'Välj en användare för att se användarens inlägg.',
    );
  });

  it('visar ett fel om användarna inte gick att hämta', () => {
    const fixture = MockRender(InlaggSida);

    anvandare.fail();
    fixture.detectChanges();

    expect(ngMocks.formatText(ngMocks.find('.fel'))).toBe('Kunde inte hämta användarna.');
  });
});
