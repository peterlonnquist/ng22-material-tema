import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { Inlagg } from './inlagg.model';
import { InlaggService, JSONPLACEHOLDER_URL } from './inlagg.service';

const INLAGG: Inlagg[] = [
  { id: 1, userId: 3, title: 'lorem', body: 'quia et\nsuscipit recusandae' },
];

describe('InlaggService', () => {
  beforeEach(() =>
    MockBuilder(InlaggService).provide(provideHttpClient()).provide(provideHttpClientTesting()),
  );

  /** Låter resurserna reagera på ändrade signaler och färdiga svar. */
  const vantaPaResurser = () => TestBed.inject(ApplicationRef).whenStable();

  it('hämtar inlägg för användaren och på nytt när id ändras', async () => {
    const http = TestBed.inject(HttpTestingController);
    const id = signal('3');
    const inlagg = TestBed.runInInjectionContext(() => TestBed.inject(InlaggService).inlagg(id));
    TestBed.tick();

    http.expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=3`).flush(INLAGG);
    await vantaPaResurser();
    expect(inlagg.value()).toEqual([{ ...INLAGG[0], antalOrd: 4 }]); // tillagt av parse

    id.set('7');
    TestBed.tick();

    expect(inlagg.isLoading()).toBe(true);
    http.expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=7`).flush([]);
    await vantaPaResurser();
    expect(inlagg.value()).toEqual([]);
  });

  it('avbryter ett pågående anrop när id ändras', () => {
    const http = TestBed.inject(HttpTestingController);
    const id = signal('1');
    TestBed.runInInjectionContext(() => TestBed.inject(InlaggService).inlagg(id));
    TestBed.tick();
    const forsta = http.expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=1`);

    id.set('2');
    TestBed.tick();

    expect(forsta.cancelled).toBe(true);
    http.expectOne(`${JSONPLACEHOLDER_URL}/posts?userId=2`);
  });

  it('hämtar alla användare', async () => {
    const anvandare = TestBed.runInInjectionContext(() =>
      TestBed.inject(InlaggService).anvandare(),
    );
    TestBed.tick();

    TestBed.inject(HttpTestingController)
      .expectOne(`${JSONPLACEHOLDER_URL}/users`)
      .flush([{ id: 1, name: 'Leanne Graham', email: 'sincere@april.biz' }]);
    await vantaPaResurser();

    expect(anvandare.value().map((a) => a.name)).toEqual(['Leanne Graham']);
  });
});
