import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/** Namespace for custom SVG icons: <mat-icon svgIcon="app:name"> */
export const CUSTOM_ICON_NAMESPACE = 'app';

/** Folder in public/ containing custom SVG icons (served as /assets/icons/...). */
const CUSTOM_ICON_PATH = '/assets/icons';

/**
 * Angular Material icon configuration for <mat-icon>:
 *
 * - Font icons (default): <mat-icon>home</mat-icon>
 *   Uses the Material Symbols Outlined icon font, see src/styles/_fonts.scss.
 *
 * - Custom SVG icons: <mat-icon svgIcon="app:logo"></mat-icon>
 *   Loaded from public/assets/icons/logo.svg. To add an icon, drop an .svg file
 *   in that folder, no registration needed. Use fill="currentColor" (or no fill)
 *   in the SVG so the icon follows the theme colors.
 *
 * Requires provideHttpClient(), since the SVG files are fetched with HttpClient.
 */
export function provideMaterialIcons(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },

    provideEnvironmentInitializer(() => {
      const registry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);

      registry.addSvgIconResolver((name, namespace) =>
        namespace === CUSTOM_ICON_NAMESPACE
          ? // Safe: the URL always points to the app's own files
            sanitizer.bypassSecurityTrustResourceUrl(`${CUSTOM_ICON_PATH}/${name}.svg`)
          : null,
      );
    }),
  ]);
}
