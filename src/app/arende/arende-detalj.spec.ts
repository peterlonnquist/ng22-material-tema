import { provideRouter, RouterLink } from '@angular/router';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { ArendeDetalj } from './arende-detalj';
import { Arende } from './arende.model';
import { ArendeService } from './arende.service';

const ARENDE: Arende = {
  id: '42',
  skapad: new Date(2026, 10, 6),
  titel: 'Ny rapport',
  beskrivning: 'Månadsrapport för november',
  kategori: 'forbattring',
  prioritet: 'hog',
  miljo: 'test',
  kontakt: 'anna@example.com',
  timmar: 8,
  deadline: new Date(2026, 11, 1),
};

describe('ArendeDetalj', () => {
  // ArendeService mockas och svarar bara på id 42. RouterLink behålls för att
  // kunna kontrollera länkarnas adresser.
  beforeEach(() =>
    MockBuilder(ArendeDetalj)
      .keep(RouterLink)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide(provideRouter([]))
      .mock(ArendeService, { hamta: (id: string) => (id === ARENDE.id ? ARENDE : undefined) }),
  );

  /** Värdena i <dl>, som { Rubrik: 'värde' }. */
  function uppgifter(): Record<string, string> {
    const rubriker = ngMocks.findAll('dt').map((el) => ngMocks.formatText(el));
    const varden = ngMocks.findAll('dd').map((el) => ngMocks.formatText(el));
    return Object.fromEntries(rubriker.map((r, i) => [r, varden[i]]));
  }

  it('visar ärendet med läsbara texter i stället för interna värden', async () => {
    const fixture = MockRender(ArendeDetalj, { id: '42' });
    await fixture.whenStable();

    expect(ngMocks.formatText(ngMocks.find('mat-card-title'))).toBe('Ny rapport');
    expect(ngMocks.formatText(ngMocks.find('mat-card-subtitle'))).toBe(
      'Ärende 42, skapat 2026-11-06',
    );
    expect(uppgifter()).toEqual({
      Kategori: 'Förbättring',
      Prioritet: 'Hög',
      Miljö: 'Test',
      Kontakt: 'anna@example.com',
      'Uppskattad tid': '8 timmar',
      Deadline: '2026-12-01',
    });
    expect(ngMocks.findAll('a').map((a) => a.attributes['href'])).toEqual(['/', '/skapa']);
  });

  it('visar "hittades inte" för ett okänt id', async () => {
    const fixture = MockRender(ArendeDetalj, { id: '99' });
    await fixture.whenStable();

    expect(ngMocks.formatText(ngMocks.find('mat-card-title'))).toBe('Ärendet hittades inte');
    expect(ngMocks.formatText(ngMocks.find('mat-card-content'))).toBe(
      'Det finns inget ärende med id 99.',
    );
  });
});
