import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { FelDialog, FelDialogData } from './fel-dialog';

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
 * Global felhantering för HTTP: visar en Material-dialog när ett API-anrop
 * misslyckas. Felet skickas sedan vidare, så att den som anropade kan avbryta
 * det den höll på med (t.ex. inte navigera vidare), men behöver inte visa något.
 */
export const httpFelInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((fel: unknown) => {
      if (
        fel instanceof HttpErrorResponse &&
        req.url.startsWith(API_PREFIX) &&
        req.context.get(VISA_FELDIALOG) &&
        // Visa bara en feldialog åt gången, även om flera anrop misslyckas samtidigt
        !dialog.openDialogs.some((d) => d.componentInstance instanceof FelDialog)
      ) {
        dialog.open<FelDialog, FelDialogData>(FelDialog, {
          data: tillDialogData(fel, req),
          width: '420px',
        });
      }
      return throwError(() => fel);
    }),
  );
};

/** Översätter HTTP-felet till text som användaren förstår. */
function tillDialogData(fel: HttpErrorResponse, req: HttpRequest<unknown>): FelDialogData {
  const detaljer = `HTTP ${fel.status} · ${req.method} ${req.url}`;
  // Valideringsfel från servern brukar ha ett eget meddelande i svaret
  const serverMeddelande: unknown = fel.error?.message;

  if (fel.status === 0) {
    return {
      rubrik: 'Ingen kontakt med servern',
      meddelande: 'Kontrollera din internetanslutning och försök igen.',
      detaljer,
    };
  }
  if (fel.status === 401 || fel.status === 403) {
    return {
      rubrik: 'Behörighet saknas',
      meddelande: 'Du har inte behörighet att göra detta.',
      detaljer,
    };
  }
  if (fel.status === 404) {
    return { rubrik: 'Hittades inte', meddelande: 'Det du letade efter finns inte.', detaljer };
  }
  if (fel.status >= 400 && fel.status < 500 && typeof serverMeddelande === 'string') {
    return { rubrik: 'Kunde inte genomföras', meddelande: serverMeddelande, detaljer };
  }
  return {
    rubrik: 'Något gick fel',
    meddelande: 'Ett oväntat fel uppstod. Försök igen om en stund.',
    detaljer,
  };
}
