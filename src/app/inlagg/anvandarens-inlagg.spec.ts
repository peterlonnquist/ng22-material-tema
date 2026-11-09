import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import type { Mock } from 'vitest';
import { createFakeHttpResource, FakeHttpResource } from '../../testing/fake-http-resource';
import { AnvandarensInlagg } from './anvandarens-inlagg';
import { InlaggVy } from './inlagg.model';
import { InlaggService } from './inlagg.service';

describe('AnvandarensInlagg', () => {
  // InlaggService mockas: inlagg() ger en fejkad resurs som testet styr.
  // Hämtning, avbrytning och parse testas i inlagg.service.spec.ts.
  let fakeHttpResource: FakeHttpResource<InlaggVy[]>;
  let inlaggSpion: Mock<InlaggService['inlagg']>;

  beforeEach(() => {
    fakeHttpResource = createFakeHttpResource<InlaggVy[]>([]);
    inlaggSpion = vi.fn(() => fakeHttpResource);
    return MockBuilder(AnvandarensInlagg).mock(InlaggService, { inlagg: inlaggSpion });
  });

  /** Renderar med anvandarId som input, som routern gör från URL:en. */
  function visa(anvandarId = '1') {
    const fixture = MockRender(AnvandarensInlagg, { anvandarId });
    /** Uppdaterar vyn efter att testet ändrat resursens läge. */
    const uppdatera = () => fixture.detectChanges();
    const text = (sel: string) => ngMocks.findAll(sel).map((el) => ngMocks.formatText(el));
    return { fixture, uppdatera, text };
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
});
