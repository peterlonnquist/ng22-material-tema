import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { TOMT_ARENDE } from '../skapa/skapa.model';
import { Arende } from './arende.model';
import { ArendeService } from './arende.service';

describe('ArendeService', () => {
  beforeEach(() =>
    MockBuilder(ArendeService).provide(provideHttpClient()).provide(provideHttpClientTesting()),
  );

  it('skickar ärendet med POST och kan hämta det efteråt', async () => {
    const service = TestBed.inject(ArendeService);
    const http = TestBed.inject(HttpTestingController);
    const nytt = { ...TOMT_ARENDE, titel: 'Ny rapport' };

    const svar = service.skapa(nytt);
    const anrop = http.expectOne('/api/arenden');
    expect(anrop.request.method).toBe('POST');
    expect(anrop.request.body).toEqual(nytt);
    anrop.flush({ ...nytt, id: '42', skapad: new Date() } satisfies Arende);

    expect(await svar).toMatchObject({ id: '42', titel: 'Ny rapport' });
    expect(service.hamta('42')).toMatchObject({ titel: 'Ny rapport' });
  });

  it('skickar vidare felet om anropet misslyckas och sparar inget', async () => {
    const service = TestBed.inject(ArendeService);

    const svar = service.skapa({ ...TOMT_ARENDE, titel: 'Ny rapport' });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/arenden')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    await expect(svar).rejects.toMatchObject({ status: 500 });
    expect(service.hamta('1')).toBeUndefined();
  });

  it('ger undefined för ett id som inte finns', () => {
    expect(TestBed.inject(ArendeService).hamta('99')).toBeUndefined();
  });
});
