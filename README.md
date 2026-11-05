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
| `src/styles/_theme-colors.scss` | Genererade tonpaletter (primär, sekundär, tertiär, neutral, error) och högkontrast-mixin |
| `src/styles.scss` | `mat.theme()` med egna paletter, typsnitt och densitet, plus `theme-overrides` och `*-overrides` per komponent |
| `src/app/tema/tema.service.ts` | Växlar ljust, mörkt eller systemläge genom att sätta en klass på `<html>` |
| `src/app/app.scss` | Komponentstilar som bara använder `--mat-sys-*`-variabler |

### Byta färger

Kör schematic:en igen med nya hex-värden. Den skriver över `_theme-colors.scss`:

```bash
ng generate @angular/material:theme-color \
  --primary-color='#0F5257' --secondary-color='#4F6F52' \
  --tertiary-color='#D98E04' --neutral-color='#5E6360' \
  --error-color='#BA1A1A' --directory=src/styles/ --is-scss=true \
  --include-high-contrast=true
```

### Det här visar demon

- **Egna paletter** i `mat.theme((color: (primary: …, tertiary: …)))`.
- **Ljust och mörkt läge** med `color-scheme: light dark`. M3-temat använder `light-dark()`, så ett enda tema räcker för båda lägena.
- **Högkontrast** via `@media (prefers-contrast: more)`.
- **Typografi**: Space Grotesk som brand-typsnitt och Inter som plain-typsnitt.
- **Systemtokens** skrivs över med `mat.theme-overrides()` (hörnradier).
- **Komponenttokens** skrivs över med `mat.button-overrides()`, `mat.toolbar-overrides()`, `mat.card-overrides()`, `mat.fab-overrides()` och `mat.button-toggle-overrides()`.
- **Lokalt tema**: `.kompakt` anropar `mat.theme((density: -2))` för en del av sidan.
- **Egna komponenter** stylas med `var(--mat-sys-…)` så att de följer temat automatiskt.
