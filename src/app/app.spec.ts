import { TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { App } from './app';
import { TemaService } from './tema/tema.service';

describe('App', () => {
  // Material-komponenterna mockas. RouterLink och tjänster i rotinjektorn
  // (Router, TemaService) behålls så att länkar och färgläge fungerar på riktigt.
  beforeEach(() =>
    MockBuilder(App).keep(RouterLink).keep(NG_MOCKS_ROOT_PROVIDERS).provide(provideRouter([])),
  );

  it('skapar appen', () => {
    const fixture = MockRender(App);
    expect(fixture.point.componentInstance).toBeInstanceOf(App);
  });

  it('visar menylänkar till Start och Skapa', () => {
    MockRender(App);
    const lankar = ngMocks.findAll('nav.meny a');
    expect(lankar.map((a) => ngMocks.formatText(a))).toEqual(['Start', 'Skapa']);
    expect(lankar.map((a) => a.nativeElement.getAttribute('href'))).toEqual(['/', '/skapa']);
  });

  it('sätter mörkt-tema-klassen på <html> när man väljer mörkt läge', async () => {
    const fixture = MockRender(App);

    // Simulerar att användaren väljer "Mörkt" i den mockade button-toggle-gruppen
    ngMocks.output('mat-button-toggle-group', 'change').emit({ value: 'morkt' });
    await fixture.whenStable();

    expect(TestBed.inject(TemaService).lage()).toBe('morkt');
    expect(document.documentElement.classList.contains('morkt-tema')).toBe(true);
    expect(document.documentElement.classList.contains('ljust-tema')).toBe(false);
  });
});
