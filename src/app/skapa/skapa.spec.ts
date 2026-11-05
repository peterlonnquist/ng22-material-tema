import { TestBed } from '@angular/core/testing';
import { WritableSignal } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Skapa } from './skapa';
import { NyttArende } from './skapa.model';

/** Ger testet åtkomst till komponentens skyddade signaler. */
type SkapaInternt = {
  arende: WritableSignal<NyttArende>;
  skapat: WritableSignal<NyttArende | null>;
};

function imorgon(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}

describe('Skapa', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'sv-SE' }],
    });
  });

  async function skapaSida() {
    const fixture = TestBed.createComponent(Skapa);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const komponent = fixture.componentInstance as unknown as SkapaInternt;
    const skicka = async () => {
      element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
    };
    const felmeddelanden = () =>
      [...element.querySelectorAll('mat-error')].map((e) => e.textContent?.trim());
    return { fixture, element, komponent, skicka, felmeddelanden };
  }

  it('skriver det man skriver i titelfältet till modellen', async () => {
    const { fixture, element, komponent } = await skapaSida();
    const titel = element.querySelector<HTMLInputElement>('input[matInput]')!;

    titel.value = 'Inloggningen fungerar inte';
    titel.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(komponent.arende().titel).toBe('Inloggningen fungerar inte');
  });

  it('visar felmeddelanden och skapar inget när obligatoriska fält saknas', async () => {
    const { komponent, skicka, felmeddelanden } = await skapaSida();

    await skicka();

    expect(felmeddelanden()).toEqual(
      expect.arrayContaining([
        'Ange en titel',
        'Välj en kategori',
        'Välj en miljö',
        'Ange en e-postadress',
        'Välj ett datum',
      ]),
    );
    expect(komponent.skapat()).toBeNull();
  });

  it('validerar e-post, antal timmar och att datumet inte har passerat', async () => {
    const { komponent, skicka, felmeddelanden } = await skapaSida();
    komponent.arende.update((a) => ({
      ...a,
      kontakt: 'inte-en-adress',
      timmar: 500,
      deadline: new Date(2020, 0, 1),
    }));

    await skicka();

    expect(felmeddelanden()).toEqual(
      expect.arrayContaining([
        'Ange en giltig e-postadress',
        'Högst 200 timmar',
        'Datumet kan inte ha passerat',
      ]),
    );
  });

  it('skapar ärendet och tömmer formuläret när allt är giltigt', async () => {
    const { fixture, komponent, skicka, felmeddelanden } = await skapaSida();
    const deadline = imorgon();
    komponent.arende.set({
      titel: 'Ny rapport',
      beskrivning: 'Månadsrapport för november',
      kategori: 'forbattring',
      prioritet: 'hog',
      miljo: 'test',
      kontakt: 'anna@example.com',
      timmar: 8,
      deadline,
    });

    await skicka();
    await new Promise((klar) => setTimeout(klar, 700)); // fejkad sparning tar 600 ms
    await fixture.whenStable();

    expect(felmeddelanden()).toEqual([]);
    expect(komponent.skapat()).toMatchObject({ titel: 'Ny rapport', miljo: 'test', deadline });
    expect(komponent.arende().titel).toBe('');
    expect(komponent.arende().prioritet).toBe('normal');
  });
});
