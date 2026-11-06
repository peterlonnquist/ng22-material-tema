import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMaterialIcons } from './app.material-icons';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: route-parametrar som :id blir komponent-inputs
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(), // behövs för att hämta egna SVG-ikoner
    provideMaterialIcons(), // ikonfont som standard + egna SVG-ikoner (svgIcon="namn")
    // Datumväljaren: JavaScripts Date och svenskt datumformat (ÅÅÅÅ-MM-DD)
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sv-SE' },
  ],
};
