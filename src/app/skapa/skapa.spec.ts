import { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, FormField, FormRoot } from '@angular/forms/signals';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { Skapa } from './skapa';
import { NyttArende } from './skapa.model';

/** Ger testet åtkomst till komponentens skyddade medlemmar. */
type SkapaInternt = {
  arende: WritableSignal<NyttArende>;
  skapat: WritableSignal<NyttArende | null>;
  arendeForm: FieldTree<NyttArende>;
};

function imorgon(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}

describe('Skapa', () => {
  // Signal Forms (FormField, FormRoot) och deras interna tjänster i rotinjektorn
  // testas på riktigt. Material-komponenterna och MatSnackBar mockas.
  beforeEach(() =>
    MockBuilder(Skapa)
      .keep(FormField)
      .keep(FormRoot)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(MatSnackBar),
  );

  async function skapaSida() {
    const fixture = MockRender(Skapa);
    await fixture.whenStable();
    const komponent = fixture.point.componentInstance as unknown as SkapaInternt;
    const skicka = async () => {
      ngMocks.trigger(ngMocks.find('form'), 'submit');
      await fixture.whenStable();
    };
    /** Felmeddelanden för ett fält, direkt från Signal Forms. */
    const fel = (falt: keyof NyttArende) =>
      komponent.arendeForm[falt]()
        .errors()
        .map((e) => e.message);
    return { fixture, komponent, skicka, fel };
  }

  it('skriver det man skriver i titelfältet till modellen', async () => {
    const { fixture, komponent } = await skapaSida();

    ngMocks.change('input[matInput]', 'Inloggningen fungerar inte');
    await fixture.whenStable();

    expect(komponent.arende().titel).toBe('Inloggningen fungerar inte');
  });

  it('skriver valet i en select till modellen', async () => {
    const { fixture, komponent } = await skapaSida();

    // Mockade mat-select har en ControlValueAccessor som ng-mocks kan styra
    ngMocks.change(ngMocks.findAll('mat-select')[2], 'prod');
    await fixture.whenStable();

    expect(komponent.arende().miljo).toBe('prod');
  });

  it('kräver titel, kategori, miljö, e-post och deadline', async () => {
    const { komponent, skicka, fel } = await skapaSida();

    await skicka();

    expect(fel('titel')).toEqual(['Ange en titel']);
    expect(fel('kategori')).toEqual(['Välj en kategori']);
    expect(fel('miljo')).toEqual(['Välj en miljö']);
    expect(fel('kontakt')).toEqual(['Ange en e-postadress']);
    expect(fel('deadline')).toEqual(['Välj ett datum']);
    expect(fel('prioritet')).toEqual([]);
    expect(komponent.arendeForm.titel().touched()).toBe(true);
    expect(komponent.skapat()).toBeNull();
  });

  it('validerar titelns längd, e-post, antal timmar och att datumet inte har passerat', async () => {
    const { komponent, fel } = await skapaSida();

    komponent.arende.update((a) => ({
      ...a,
      titel: 'ab',
      kontakt: 'inte-en-adress',
      timmar: 500,
      deadline: new Date(2020, 0, 1),
    }));

    expect(fel('titel')).toEqual(['Titeln måste vara minst 3 tecken']);
    expect(fel('kontakt')).toEqual(['Ange en giltig e-postadress']);
    expect(fel('timmar')).toEqual(['Högst 200 timmar']);
    expect(fel('deadline')).toEqual(['Datumet kan inte ha passerat']);
  });

  it('skapar ärendet, visar en snackbar och tömmer formuläret när allt är giltigt', async () => {
    const { fixture, komponent, skicka } = await skapaSida();
    const snackBar = TestBed.inject(MatSnackBar);
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
    expect(komponent.arendeForm().valid()).toBe(true);

    await skicka();
    await new Promise((klar) => setTimeout(klar, 700)); // fejkad sparning tar 600 ms
    await fixture.whenStable();

    expect(komponent.skapat()).toMatchObject({ titel: 'Ny rapport', miljo: 'test', deadline });
    expect(snackBar.open).toHaveBeenCalledWith('Ärendet "Ny rapport" har skapats', 'Stäng', {
      duration: 4000,
    });
    expect(komponent.arende().titel).toBe('');
    expect(komponent.arende().prioritet).toBe('normal');
  });
});
