import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/** Mapp i public/ med egna SVG-ikoner (serveras som /assets/icons/...). */
const CUSTOM_ICON_PATH = '/assets/icons';

/**
 * Ikonkonfiguration för Angular Materials <mat-icon>:
 *
 * - Fontikoner (standard): <mat-icon>home</mat-icon>
 *   Använder ikonfonten Material Symbols Outlined, se src/styles/_fonts.scss.
 *
 * - Egna SVG-ikoner: <mat-icon svgIcon="logo"></mat-icon>
 *   Hämtas från public/assets/icons/logo.svg. Ny ikon = lägg en .svg-fil i
 *   mappen, ingen registrering behövs. Använd fill="currentColor" (eller ingen
 *   fill) i SVG:n så att ikonen följer temats färger.
 *
 * Kräver provideHttpClient(), eftersom SVG-filerna hämtas via HttpClient.
 */
export function provideMaterialIcons(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },

    provideEnvironmentInitializer(() => {
      const registry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);

      registry.addSvgIconResolver((name, namespace) =>
        // Bara ikoner utan namespace (svgIcon="logo"). Namn med prefix, t.ex.
        // "flaggor:se", lämnas åt andra ikonuppsättningar.
        namespace === ''
          ? // Säkert: adressen pekar alltid på appens egna filer
            sanitizer.bypassSecurityTrustResourceUrl(`${CUSTOM_ICON_PATH}/${name}.svg`)
          : null,
      );
    }),
  ]);
}
