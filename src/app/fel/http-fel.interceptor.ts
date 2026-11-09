import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { DialogService } from '../dialog/dialog.service';
import { MeddelandeDialogData } from '../dialog/meddelande-dialog';

/** Bara anrop mot appens API visar feldialog, inte t.ex. ikoner under /assets/. */
const API_PREFIX = '/api/';

/**
 * Stäng av feldialogen för ett enskilt anrop som hanterar sina fel själv,
 * t.ex. ett 409 som ska visas vid ett formulärfält:
 *
 *   this.http.post(url, data, { context: new HttpContext().set(VISA_FELDIALOG, false) })
 */
export const VISA_FELDIALOG = new HttpContextToken<boolean>(() => true);

/**
 * Global felhantering för HTTP: visar en feldialog via DialogService när ett
 * API-anrop misslyckas. Felet skickas sedan vidare, så att den som anropade kan avbryta
 * det den höll på med (t.ex. inte navigera vidare), men behöver inte visa något.
 */
export const httpFelInterceptor: HttpInterceptorFn = (req, next) => {
  const dialoger = inject(DialogService);

  return next(req).pipe(
    catchError((fel: unknown) => {
      if (
        fel instanceof HttpErrorResponse &&
        req.url.startsWith(API_PREFIX) &&
        req.context.get(VISA_FELDIALOG)
      ) {
        // DialogService visar bara en feldialog åt gången, även om flera anrop
        // misslyckas samtidigt. Interceptorn väntar inte på att den stängs.
        void dialoger.showMessage(tillDialogData(fel, req));
      }
      return throwError(() => fel);
    }),
  );
};

/** Översätter HTTP-felet till text som användaren förstår. */
function tillDialogData(fel: HttpErrorResponse, req: HttpRequest<unknown>): MeddelandeDialogData {
  const detaljer = `HTTP ${fel.status} · ${req.method} ${req.url}`;
  // Valideringsfel från servern brukar ha ett eget meddelande i svaret
  const serverMeddelande: unknown = fel.error?.message;

  if (fel.status === 0) {
    return {
      typ: 'fel',
      rubrik: 'Ingen kontakt med servern',
      meddelande: 'Kontrollera din internetanslutning och försök igen.',
      detaljer,
    };
  }
  if (fel.status === 401 || fel.status === 403) {
    return {
      typ: 'fel',
      rubrik: 'Behörighet saknas',
      meddelande: 'Du har inte behörighet att göra detta.',
      detaljer,
    };
  }
  if (fel.status === 404) {
    return {
      typ: 'fel',
      rubrik: 'Hittades inte',
      meddelande: 'Det du letade efter finns inte.',
      detaljer,
    };
  }
  if (fel.status >= 400 && fel.status < 500 && typeof serverMeddelande === 'string') {
    return { typ: 'fel', rubrik: 'Kunde inte genomföras', meddelande: serverMeddelande, detaljer };
  }
  return {
    typ: 'fel',
    rubrik: 'Något gick fel',
    meddelande: 'Ett oväntat fel uppstod. Försök igen om en stund.',
    detaljer,
  };
}
