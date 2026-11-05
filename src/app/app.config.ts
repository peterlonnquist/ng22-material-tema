import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideMaterialIcons } from './app.material-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(), // behövs för att hämta egna SVG-ikoner
    provideMaterialIcons(), // ikonfont som standard + egna SVG-ikoner (app:namn)
  ],
};
