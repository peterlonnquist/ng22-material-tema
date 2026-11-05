# ng22-material-tema

Exempelapp med **Angular 22.2.6** och **Angular Material 22.2.6** (Material 3) med ett eget tema.
Skapad med vanliga Angular CLI (inte Nx): standalone-komponenter, zoneless, signals och Vitest.

## Kom igång

```bash
npm install
npm start          # http://localhost:4200
npm test           # Vitest
npm run build
```

## Hur temat är uppbyggt

| Fil | Innehåll |
| --- | --- |
| `src/styles/_fonts.scss` | Mixins `fonts()` (Open Sans Regular och SemiBold från `public/assets/fonts`) och `icon-font()` (Material Symbols Outlined från npm-paketet `material-symbols`). Allt serveras lokalt, inget från Google. |
| `src/styles/_theme.scss` | Mixin med `mat.theme()`: azure-blue-paletterna, typsnitt, densitet och ljust/mörkt läge |
| `src/styles/_overrides.scss` | Mixin med `theme-overrides` och `*-overrides` per komponent |
| `src/styles.scss` | Enda ingångsfilen: tar in partials ovan på `html`, plus global bas-CSS (`body`, rubriker) |
| `src/app/app.material-icons.ts` | `provideMaterialIcons()`: ikonfonten som standard för `<mat-icon>` och egna SVG-ikoner via `svgIcon="app:namn"` från `public/assets/icons` |
| `src/app/tema/tema.service.ts` | Växlar ljust, mörkt eller systemläge genom att sätta en klass på `<html>` |
| `src/app/app.scss` | Komponentstilar som bara använder `--mat-sys-*`-variabler |

### Byta färger

Färgerna motsvarar prebuilt-temat `azure-blue.css`: `primary: mat.$azure-palette` och `tertiary: mat.$blue-palette`. Andra prebuilt-teman fås genom att byta paletter, t.ex. `mat.$cyan-palette` + `mat.$orange-palette` för `cyan-orange`.

En helt egen palett genereras med `ng generate @angular/material:theme-color`.

### Det här visar demon

- **Inbyggda M3-paletter** (azure + blue) i `mat.theme((color: (primary: …, tertiary: …)))`.
- **Ljust och mörkt läge** med `color-scheme: light dark`. M3-temat använder `light-dark()`, så ett enda tema räcker för båda lägena.
- **Typografi**: endast Open Sans (Regular och SemiBold), laddas lokalt från `public/assets/fonts`.
- **Ikoner** via ikonfonten Material Symbols Outlined från npm-paketet `material-symbols`, serveras lokalt. Egna SVG-ikoner läggs i `public/assets/icons/` och används med `<mat-icon svgIcon="app:namn">`. Båda konfigureras med `provideMaterialIcons()` i `app.config.ts`.
- **Systemtokens** skrivs över med `mat.theme-overrides()` (hörnradier).
- **Komponenttokens** skrivs över med `mat.button-overrides()`, `mat.toolbar-overrides()`, `mat.card-overrides()`, `mat.fab-overrides()` och `mat.button-toggle-overrides()`.
- **Lokalt tema**: `.kompakt` anropar `mat.theme((density: -2))` för en del av sidan.
- **Egna komponenter** stylas med `var(--mat-sys-…)` så att de följer temat automatiskt.
