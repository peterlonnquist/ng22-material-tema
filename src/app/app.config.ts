import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMaterialIcons } from './app.material-icons';
import { fejkBackendInterceptor } from './arende/fejk-backend.interceptor';
import { httpFelInterceptor } from './fel/http-fel.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: route-parametrar som :id blir komponent-inputs
    provideRouter(routes, withComponentInputBinding()),
    // HttpClient används för API-anrop och för att hämta egna SVG-ikoner.
    // Ordningen spelar roll: httpFelInterceptor ligger ytterst och ser därför
    // även fel från den fejkade backenden.
    provideHttpClient(withInterceptors([httpFelInterceptor, fejkBackendInterceptor])),
    provideMaterialIcons(), // ikonfont som standard + egna SVG-ikoner (svgIcon="namn")
    // Datumväljaren: JavaScripts Date och svenskt datumformat (ÅÅÅÅ-MM-DD)
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sv-SE' },
  ],
};
