import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { firstValueFrom } from 'rxjs';
import { DialogService } from '../dialog/dialog.service';
import { httpFelInterceptor, VISA_FELDIALOG } from './http-fel.interceptor';

describe('httpFelInterceptor', () => {
  // Riktig HttpClient med interceptorn, falsk backend och mockad DialogService
  beforeEach(() =>
    MockBuilder()
      .provide(provideHttpClient(withInterceptors([httpFelInterceptor])))
      .provide(provideHttpClientTesting())
      .mock(DialogService),
  );

  /** Gör ett anrop som backend svarar på med status, och returnerar felet. */
  async function misslyckas(
    url: string,
    status: number,
    context?: HttpContext,
    svar: object | null = null,
  ) {
    const anrop = firstValueFrom(TestBed.inject(HttpClient).post(url, {}, { context }));
    TestBed.inject(HttpTestingController).expectOne(url).flush(svar, { status, statusText: 'Fel' });
    return anrop.catch((fel: unknown) => fel);
  }

  it('visar en feldialog vid serverfel och skickar felet vidare', async () => {
    const fel = await misslyckas('/api/arenden', 500);

    expect(TestBed.inject(DialogService).showMessage).toHaveBeenCalledWith({
      typ: 'fel',
      rubrik: 'Något gick fel',
      meddelande: 'Ett oväntat fel uppstod. Försök igen om en stund.',
      detaljer: 'HTTP 500 · POST /api/arenden',
    });
    expect(fel).toMatchObject({ status: 500 }); // anroparen får fortfarande felet
  });

  it('visar serverns eget meddelande vid valideringsfel', async () => {
    await misslyckas('/api/arenden', 422, undefined, { message: 'Titeln finns redan' });

    expect(TestBed.inject(DialogService).showMessage).toHaveBeenCalledWith(
      expect.objectContaining({ typ: 'fel', meddelande: 'Titeln finns redan' }),
    );
  });

  it('visar ingen dialog för anrop utanför API:t, t.ex. ikoner', async () => {
    await misslyckas('/assets/icons/saknas.svg', 404);

    expect(TestBed.inject(DialogService).showMessage).not.toHaveBeenCalled();
  });

  it('visar ingen dialog när anropet stänger av den med VISA_FELDIALOG', async () => {
    await misslyckas('/api/arenden', 409, new HttpContext().set(VISA_FELDIALOG, false));

    expect(TestBed.inject(DialogService).showMessage).not.toHaveBeenCalled();
  });
});
