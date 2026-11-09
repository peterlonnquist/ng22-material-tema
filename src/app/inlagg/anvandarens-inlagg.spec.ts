import { Signal } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { fakeHttpResource, FakeHttpResource } from '../../testing/fake-http-resource';
import { AnvandarensInlagg } from './anvandarens-inlagg';
import { InlaggVy } from './inlagg.model';
import { InlaggService } from './inlagg.service';

describe('AnvandarensInlagg', () => {
  // InlaggService mockas: inlagg() ger en fejkad resurs som testet styr.
  // Hämtning, avbrytning och parse testas i inlagg.service.spec.ts.
  let inlagg: FakeHttpResource<InlaggVy[]>;
  let skickatId: Signal<string>;

  beforeEach(() => {
    inlagg = fakeHttpResource<InlaggVy[]>([]);
    return MockBuilder(AnvandarensInlagg).mock(InlaggService, {
      inlagg: (id: Signal<string>) => {
        skickatId = id;
        return inlagg;
      },
    });
  });

  /** Renderar med anvandarId som input, som routern gör från URL:en. */
  function visa(anvandarId = '1') {
    const fixture = MockRender(AnvandarensInlagg, { anvandarId });
    /** Uppdaterar vyn efter att testet ändrat resursens läge. */
    const uppdatera = () => fixture.detectChanges();
    const text = (sel: string) => ngMocks.findAll(sel).map((el) => ngMocks.formatText(el));
    return { fixture, uppdatera, text };
  }

  it('skickar id från URL:en till tjänsten som signal, så att ändringar följer med', () => {
    const { fixture, uppdatera } = visa('2');
    expect(skickatId()).toBe('2');

    // Som när routern återanvänder komponenten för /inlagg/5
    fixture.componentInstance.anvandarId = '5';
    uppdatera();

    expect(skickatId()).toBe('5'); // samma signal, inte ett kopierat värde
  });

  it('visar en förloppsindikator medan inläggen hämtas', () => {
    const { uppdatera, text } = visa();

    inlagg.loading();
    uppdatera();

    expect(ngMocks.find('mat-progress-bar', null)).not.toBeNull();
    expect(text('.tips')).toEqual([]); // inte "inga inlägg" medan det laddar
  });

  it('visar inläggen med antal ord', () => {
    const { uppdatera, text } = visa();

    inlagg.resolve([
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

    inlagg.resolve([]);
    uppdatera();

    expect(text('.tips')).toEqual(['Användaren har inga inlägg.']);
  });

  it('visar ett fel och laddar om med "Försök igen"', () => {
    const { uppdatera, text } = visa();

    inlagg.fail();
    uppdatera();

    expect(text('.fel p')).toEqual(['Kunde inte hämta inläggen.']);
    expect(text('mat-card-title')).toEqual([]);

    ngMocks.click(ngMocks.find('.fel button'));

    expect(inlagg.reload).toHaveBeenCalledTimes(1);
  });
});
