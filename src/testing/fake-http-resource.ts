import { HttpResourceRef } from '@angular/common/http';
import { resourceFromSnapshots, ResourceSnapshot, signal } from '@angular/core';
import type { Mock } from 'vitest';

/**
 * Fejkad httpResource för komponenttester. Ersätter en tjänstemetod som
 * returnerar en httpResource, så att komponenten kan testas utan HTTP:
 *
 *   const fakeHttpResource = createFakeHttpResource<InlaggVy[]>([]);
 *   MockBuilder(Komponent).mock(InlaggService, { inlagg: () => fakeHttpResource });
 *   fakeHttpResource.resolve([...]);  // eller loading(), fail()
 *
 * Bygger på Angulars resourceFromSnapshots(), så value(), isLoading(),
 * error() och hasValue() fungerar som i en riktig resurs. Bland annat kastar
 * value() i felläge. Utöver det finns bara reload(), som vi.fn().
 */
export interface FakeHttpResource<T> extends HttpResourceRef<T> {
  /** Hämtar: value() visar startvärdet, som när parametrarna ändras. */
  loading(): void;
  /** Svaret har kommit. */
  resolve(value: T): void;
  /** Anropet misslyckades. */
  fail(error?: Error): void;
  readonly reload: Mock<() => boolean>;
}

/**
 * Skapar en fejkad httpResource i läget 'idle' med startvärdet som value().
 * Startvärdet ska vara samma som defaultValue i tjänstens httpResource.
 *
 * Med startvärde, som httpResource med defaultValue:
 *   createFakeHttpResource<InlaggVy[]>([])   // FakeHttpResource<InlaggVy[]>
 */
export function createFakeHttpResource<T>(defaultValue: T): FakeHttpResource<T>;
/**
 * Utan startvärde, som httpResource utan defaultValue: value() är undefined
 * tills resolve() anropas.
 *   createFakeHttpResource<Anvandare>()      // FakeHttpResource<Anvandare | undefined>
 */
export function createFakeHttpResource<T>(): FakeHttpResource<T | undefined>;
export function createFakeHttpResource<T>(defaultValue?: T): FakeHttpResource<T | undefined> {
  const snapshot = signal<ResourceSnapshot<T | undefined>>({ status: 'idle', value: defaultValue });

  const resource = Object.assign(resourceFromSnapshots(snapshot), {
    reload: vi.fn(() => true),
    loading: () => snapshot.set({ status: 'loading', value: defaultValue }),
    resolve: (value: T | undefined) => snapshot.set({ status: 'resolved', value }),
    fail: (error = new Error('Http failure response')) => snapshot.set({ status: 'error', error }),
  });

  // Delar av HttpResourceRef som komponenterna inte använder (headers,
  // statusCode, progress, set m.fl.) saknas. Används de kraschar testet
  // tydligt, och då får de läggas till här.
  return resource as unknown as FakeHttpResource<T | undefined>;
}
