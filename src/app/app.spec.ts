import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { provideMaterialIcons } from './app.material-icons';
import { TemaService } from './tema/tema.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideMaterialIcons()],
    }).compileComponents();
  });

  it('skapar appen', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('visar rubriken', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Eget Material 3-tema');
  });

  it('sätter mörkt-tema-klassen på <html> när läget ändras', async () => {
    const fixture = TestBed.createComponent(App);
    const tema = TestBed.inject(TemaService);

    tema.lage.set('morkt');
    await fixture.whenStable();

    expect(document.documentElement.classList.contains('morkt-tema')).toBe(true);
    expect(document.documentElement.classList.contains('ljust-tema')).toBe(false);
  });

  it('hämtar egna SVG-ikoner från /assets/icons', async () => {
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    http
      .expectOne('/assets/icons/logo.svg')
      .flush('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>');
    await fixture.whenStable();

    const ikon = (fixture.nativeElement as HTMLElement).querySelector('mat-toolbar mat-icon svg');
    expect(ikon).not.toBeNull();
    http.verify();
  });
});
