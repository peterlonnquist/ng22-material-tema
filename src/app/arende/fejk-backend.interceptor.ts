import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { switchMap, throwError, timer } from 'rxjs';
import { NyttArende } from '../skapa/skapa.model';
import { Arende } from './arende.model';

let nastaId = 1;

/**
 * Fejkad backend för POST /api/arenden, så att appen kan köras utan server.
 * Ta bort den här och dess rad i app.config.ts när det finns ett riktigt API.
 *
 * För att prova feldialogen: skapa ett ärende med "500" i titeln.
 */
export const fejkBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.url !== '/api/arenden') {
    return next(req);
  }
  const nytt = req.body as NyttArende;

  // Låtsas nätverksfördröjning
  return timer(600).pipe(
    switchMap(() => {
      if (nytt.titel.includes('500')) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
              statusText: 'Internal Server Error',
              url: req.url,
            }),
        );
      }
      const arende: Arende = { ...nytt, id: String(nastaId++), skapad: new Date() };
      return [new HttpResponse({ status: 201, body: arende })];
    }),
  );
};
