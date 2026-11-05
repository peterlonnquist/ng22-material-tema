import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TemaService } from './tema/tema.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
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
});
