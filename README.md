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
| `src/styles/_fonts.scss` | `@font-face` för Open Sans Regular och SemiBold (text) och Material Symbols Outlined (ikoner). Allt serveras lokalt från `public/assets/fonts`, inget från Google. |
| `src/styles/_theme.scss` | Mixin med `mat.theme()`: azure-blue-paletterna, typsnitt, densitet och ljust/mörkt läge |
| `src/styles/_overrides.scss` | Mixin med `theme-overrides` och `*-overrides` per komponent |
| `src/styles.scss` | Enda ingångsfilen: tar in partials ovan på `html`, plus global bas-CSS (`body`, rubriker) |
| `src/app/tema/tema.service.ts` | Växlar ljust, mörkt eller systemläge genom att sätta en klass på `<html>` |
| `src/app/app.scss` | Komponentstilar som bara använder `--mat-sys-*`-variabler |

### Byta färger

Färgerna motsvarar prebuilt-temat `azure-blue.css`: `primary: mat.$azure-palette` och `tertiary: mat.$blue-palette`. Andra prebuilt-teman fås genom att byta paletter, t.ex. `mat.$cyan-palette` + `mat.$orange-palette` för `cyan-orange`.

En helt egen palett genereras med `ng generate @angular/material:theme-color`.

### Det här visar demon

- **Inbyggda M3-paletter** (azure + blue) i `mat.theme((color: (primary: …, tertiary: …)))`.
- **Ljust och mörkt läge** med `color-scheme: light dark`. M3-temat använder `light-dark()`, så ett enda tema räcker för båda lägena.
- **Typografi**: endast Open Sans (Regular och SemiBold), laddas lokalt från `public/assets/fonts`.
- **Ikoner** via ikonfonten Material Symbols Outlined, lokalt från `public/assets/fonts`. `<mat-icon>` pekas mot den via `MAT_ICON_DEFAULT_OPTIONS` i `app.config.ts`.
- **Systemtokens** skrivs över med `mat.theme-overrides()` (hörnradier).
- **Komponenttokens** skrivs över med `mat.button-overrides()`, `mat.toolbar-overrides()`, `mat.card-overrides()`, `mat.fab-overrides()` och `mat.button-toggle-overrides()`.
- **Lokalt tema**: `.kompakt` anropar `mat.theme((density: -2))` för en del av sidan.
- **Egna komponenter** stylas med `var(--mat-sys-…)` så att de följer temat automatiskt.
