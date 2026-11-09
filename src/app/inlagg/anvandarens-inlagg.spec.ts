import { TestBed } from '@angular/core/testing';
import { FieldTree, FormField, FormRoot } from '@angular/forms/signals';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import type { Mock } from 'vitest';
import { createFakeHttpResource, FakeHttpResource } from '../../testing/fake-http-resource';
import { AnvandarensInlagg } from './anvandarens-inlagg';
import { InlaggVy } from './inlagg.model';
import { InlaggService } from './inlagg.service';

describe('AnvandarensInlagg', () => {
  // InlaggService mockas: inlagg() ger en fejkad resurs som testet styr och
  // skapa() är en spion. Hämtning, POST och parse testas i inlagg.service.spec.ts.
  // Signal Forms och deras rottjänster körs på riktigt, MatSnackBar mockas.
  let fakeHttpResource: FakeHttpResource<InlaggVy[]>;
  let inlaggSpion: Mock<InlaggService['inlagg']>;
  let skapaSpion: Mock<InlaggService['skapa']>;

  beforeEach(() => {
    fakeHttpResource = createFakeHttpResource<InlaggVy[]>([]);
    inlaggSpion = vi.fn(() => fakeHttpResource);
    skapaSpion = vi.fn();
    return MockBuilder(AnvandarensInlagg)
      .keep(FormField)
      .keep(FormRoot)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(MatSnackBar)
      .mock(InlaggService, { inlagg: inlaggSpion, skapa: skapaSpion });
  });

  /** Renderar med anvandarId som input, som routern gör från URL:en. */
  function visa(anvandarId = '1') {
    const fixture = MockRender(AnvandarensInlagg, { anvandarId });
    /** Uppdaterar vyn efter att testet ändrat resursens läge. */
    const uppdatera = () => fixture.detectChanges();
    const text = (sel: string) => ngMocks.findAll(sel).map((el) => ngMocks.formatText(el));
    /** Fyller i formuläret för nytt inlägg. */
    const fyllI = async (titel: string, brodtext: string) => {
      ngMocks.change('input[matInput]', titel);
      ngMocks.change('textarea[matInput]', brodtext);
      await fixture.whenStable();
    };
    /** Skickar formuläret och väntar tills det är klart. */
    const publicera = async () => {
      ngMocks.trigger(ngMocks.find('form'), 'submit');
      await fixture.whenStable();
    };
    return { fixture, uppdatera, text, fyllI, publicera };
  }

  it('hämtar inläggen för användaren med id:t från URL:en', () => {
    visa('3');

    expect(inlaggSpion).toHaveBeenCalledTimes(1);
    // inlagg() får en signal, inte en sträng, så värdet läses ur signalen
    const [id] = inlaggSpion.mock.calls[0];
    expect(id()).toBe('3');
  });

  it('skickar id från URL:en till tjänsten som signal, så att ändringar följer med', () => {
    const { fixture, uppdatera } = visa('2');
    const [id] = inlaggSpion.mock.lastCall!; // signalen komponenten skickade
    expect(id()).toBe('2');

    // Som när routern återanvänder komponenten för /inlagg/5
    fixture.componentInstance.anvandarId = '5';
    uppdatera();

    expect(id()).toBe('5'); // samma signal, inte ett kopierat värde
    expect(inlaggSpion).toHaveBeenCalledTimes(1); // resursen skapas inte om
  });

  it('visar en förloppsindikator medan inläggen hämtas', () => {
    const { uppdatera, text } = visa();

    fakeHttpResource.loading();
    uppdatera();

    expect(ngMocks.find('mat-progress-bar', null)).not.toBeNull();
    expect(text('.tips')).toEqual([]); // inte "inga inlägg" medan det laddar
  });

  it('visar inläggen med antal ord', () => {
    const { uppdatera, text } = visa();

    fakeHttpResource.resolve([
      { id: 11, userId: 2, title: 'et ea vero quia', body: '…', antalOrd: 24 },
      { id: 12, userId: 2, title: 'in quibusdam', body: '…', antalOrd: 1 },
    ]);
    uppdatera();

    expect(text('mat-card-title')).toEqual(['et ea vero quia', 'in quibusdam']);
    expect(text('mat-card-subtitle')).toEqual(['24 ord', '1 ord']);
    expect(ngMocks.find('mat-progress-bar', null)).toBeNull();
  });

  it('visar ett meddelande när användaren saknar inlägg', () => {
    const { uppdatera, text } = visa();

    fakeHttpResource.resolve([]);
    uppdatera();

    expect(text('.tips')).toEqual(['Användaren har inga inlägg.']);
  });

  it('visar ett fel och laddar om med "Försök igen"', () => {
    const { uppdatera, text } = visa();

    fakeHttpResource.fail();
    uppdatera();

    expect(text('.fel p')).toEqual(['Kunde inte hämta inläggen.']);
    expect(text('mat-card-title')).toEqual([]);

    ngMocks.click(ngMocks.find('.fel button'));

    expect(fakeHttpResource.reload).toHaveBeenCalledTimes(1);
  });

  describe('nytt inlägg', () => {
    const SKAPAT: InlaggVy = {
      id: 101,
      userId: 3,
      title: 'Hej',
      body: 'Ett nytt inlägg',
      antalOrd: 3,
    };

    it('kräver titel och text, och skickar inget annars', async () => {
      const { publicera, text } = visa('3');

      await publicera();

      expect(text('mat-error')).toEqual(['Ange en titel', 'Skriv något']);
      expect(skapaSpion).not.toHaveBeenCalled();
    });

    it('publicerar för användaren i URL:en och lägger det nya inlägget först i listan', async () => {
      const { fixture, fyllI, publicera, text } = visa('3');
      fakeHttpResource.resolve([
        { id: 21, userId: 3, title: 'asperiores ea ipsam', body: '…', antalOrd: 24 },
      ]);
      skapaSpion.mockResolvedValue(SKAPAT);

      await fyllI('Hej', 'Ett nytt inlägg');
      await publicera();

      expect(skapaSpion).toHaveBeenCalledWith({ userId: 3, title: 'Hej', body: 'Ett nytt inlägg' });
      expect(text('.lista mat-card-title')).toEqual(['Hej', 'asperiores ea ipsam']);
      expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith(
        'Inlägget har publicerats',
        'Stäng',
        { duration: 4000 },
      );
      // Formuläret töms och är orört igen, så att mat-form-field inte visar
      // "Ange en titel" fast fälten är tomma
      const komponent = fixture.point.componentInstance as unknown as {
        nyttForm: FieldTree<{ titel: string; text: string }>;
      };
      expect(ngMocks.find<HTMLInputElement>('input[matInput]').nativeElement.value).toBe('');
      expect(komponent.nyttForm().touched()).toBe(false);
    });

    it('visar ett fel och behåller det ifyllda om publiceringen misslyckas', async () => {
      const { fyllI, publicera, text } = visa('3');
      fakeHttpResource.resolve([]);
      skapaSpion.mockRejectedValue(new Error('500'));

      await fyllI('Hej', 'Ett nytt inlägg');
      await publicera();

      expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith(
        'Kunde inte publicera inlägget, försök igen',
        'Stäng',
        { duration: 6000 },
      );
      expect(ngMocks.find<HTMLInputElement>('input[matInput]').nativeElement.value).toBe('Hej');
      expect(text('.lista mat-card-title')).toEqual([]);
    });
  });
});
