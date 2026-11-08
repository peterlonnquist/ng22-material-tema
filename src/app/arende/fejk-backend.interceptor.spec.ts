import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { firstValueFrom } from 'rxjs';
import { TOMT_ARENDE } from '../skapa/skapa.model';
import { Arende } from './arende.model';
import { fejkBackendInterceptor } from './fejk-backend.interceptor';

describe('fejkBackendInterceptor', () => {
  beforeEach(() =>
    MockBuilder().provide(provideHttpClient(withInterceptors([fejkBackendInterceptor]))),
  );

  // Falska timers så att testet inte behöver vänta på den fejkade fördröjningen
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function posta(titel: string) {
    return firstValueFrom(
      TestBed.inject(HttpClient).post<Arende>('/api/arenden', { ...TOMT_ARENDE, titel }),
    );
  }

  async function skapa(titel: string) {
    const svar = posta(titel);
    await vi.advanceTimersByTimeAsync(600);
    return svar;
  }

  it('svarar med ärendet, ett nytt id och tidpunkt', async () => {
    const forsta = await skapa('Första');
    const andra = await skapa('Andra');

    expect(forsta).toMatchObject({ titel: 'Första', prioritet: 'normal' });
    expect(forsta.skapad).toBeInstanceOf(Date);
    expect(Number(andra.id)).toBe(Number(forsta.id) + 1);
  });

  it('svarar med 500 när titeln innehåller "500"', async () => {
    // Koppla på förväntan innan tiden går, annars blir felet ohanterat
    const forvantan = expect(posta('Testa 500')).rejects.toMatchObject({ status: 500 });
    await vi.advanceTimersByTimeAsync(600);
    await forvantan;
  });
});
