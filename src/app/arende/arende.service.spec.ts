import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { TOMT_ARENDE } from '../skapa/skapa.model';
import { ArendeService } from './arende.service';

describe('ArendeService', () => {
  beforeEach(() => MockBuilder(ArendeService));

  // Falska timers så att testet inte behöver vänta på den fejkade fördröjningen
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function skapa(service: ArendeService, titel: string) {
    const svar = service.skapa({ ...TOMT_ARENDE, titel });
    await vi.advanceTimersByTimeAsync(600);
    return svar;
  }

  it('ger nya ärenden löpande id och går att hämta efteråt', async () => {
    const service = TestBed.inject(ArendeService);

    const forsta = await skapa(service, 'Första');
    const andra = await skapa(service, 'Andra');

    expect(forsta.id).toBe('1');
    expect(andra.id).toBe('2');
    expect(service.hamta('2')).toMatchObject({ titel: 'Andra', prioritet: 'normal' });
  });

  it('ger undefined för ett id som inte finns', () => {
    expect(TestBed.inject(ArendeService).hamta('99')).toBeUndefined();
  });
});
