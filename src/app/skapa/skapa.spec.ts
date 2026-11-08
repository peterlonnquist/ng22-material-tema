import { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, FormField, FormRoot } from '@angular/forms/signals';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { Arende } from '../arende/arende.model';
import { ArendeService } from '../arende/arende.service';
import { Skapa } from './skapa';
import { NyttArende } from './skapa.model';

/** Ger testet åtkomst till komponentens skyddade medlemmar. */
type SkapaInternt = {
  arende: WritableSignal<NyttArende>;
  arendeForm: FieldTree<NyttArende>;
};

function imorgon(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}

describe('Skapa', () => {
  // Signal Forms (FormField, FormRoot) och deras interna tjänster i rotinjektorn
  // testas på riktigt. Material-komponenterna, MatSnackBar och ArendeService mockas.
  // Routern är riktig, men navigate() spioneras på i testerna.
  beforeEach(() =>
    MockBuilder(Skapa)
      .keep(FormField)
      .keep(FormRoot)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide(provideRouter([]))
      .mock(MatSnackBar)
      .mock(ArendeService),
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
    expect(TestBed.inject(ArendeService).skapa).not.toHaveBeenCalled();
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

  /** Fyller formuläret med giltiga värden. */
  function fyllI(komponent: SkapaInternt): NyttArende {
    const giltigt: NyttArende = {
      titel: 'Ny rapport',
      beskrivning: 'Månadsrapport för november',
      kategori: 'forbattring',
      prioritet: 'hog',
      miljo: 'test',
      kontakt: 'anna@example.com',
      timmar: 8,
      deadline: imorgon(),
    };
    komponent.arende.set(giltigt);
    return giltigt;
  }

  it('sparar ärendet, visar en snackbar och navigerar till det nya ärendet', async () => {
    const { komponent, skicka } = await skapaSida();
    const arendeService = TestBed.inject(ArendeService);
    const snackBar = TestBed.inject(MatSnackBar);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const ifyllt = fyllI(komponent);
    vi.mocked(arendeService.skapa).mockResolvedValue({
      ...ifyllt,
      id: '42',
      skapad: new Date(),
    } satisfies Arende);

    await skicka();

    expect(arendeService.skapa).toHaveBeenCalledWith(ifyllt);
    expect(snackBar.open).toHaveBeenCalledWith('Ärendet "Ny rapport" har skapats', 'Stäng', {
      duration: 4000,
    });
    expect(navigate).toHaveBeenCalledWith(['/arenden', '42']);
  });

  // Själva feldialogen visas av httpFelInterceptor, se dess test
  it('stannar kvar med det ifyllda om sparningen misslyckas, och går att skicka igen', async () => {
    const { komponent, skicka } = await skapaSida();
    const arendeService = TestBed.inject(ArendeService);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const ifyllt = fyllI(komponent);
    vi.mocked(arendeService.skapa).mockRejectedValueOnce(new Error('500'));

    await skicka();

    expect(navigate).not.toHaveBeenCalled();
    expect(komponent.arende()).toEqual(ifyllt); // inget av det ifyllda försvinner

    // Andra försöket lyckas
    vi.mocked(arendeService.skapa).mockResolvedValueOnce({
      ...ifyllt,
      id: '7',
      skapad: new Date(),
    });
    await skicka();

    expect(navigate).toHaveBeenCalledWith(['/arenden', '7']);
  });
});
