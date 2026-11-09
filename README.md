# ng22-material-tema

Exempelapp med **Angular 22.2.6** och **Angular Material 22.2.6** (Material 3) med ett eget tema.
Skapad med vanliga Angular CLI (inte Nx): standalone-komponenter, zoneless, signals och Vitest.

## Kom igång

```bash
npm install
npm start          # http://localhost:4200
npm test           # Vitest + ng-mocks
npm run build
```

## Hur temat är uppbyggt

| Fil | Innehåll |
| --- | --- |
| `src/styles/_fonts.scss` | Mixins `fonts()` (Open Sans Regular och SemiBold från `public/assets/fonts`) och `icon-font()` (Material Symbols Outlined från npm-paketet `material-symbols`). Allt serveras lokalt, inget från Google. |
| `src/styles/_theme.scss` | Mixin med `mat.theme()`: azure-blue-paletterna, typsnitt, densitet och ljust/mörkt läge |
| `src/styles/_overrides.scss` | Mixin med `theme-overrides` och `*-overrides` per komponent |
| `src/styles.scss` | Enda ingångsfilen: tar in partials ovan på `html`, plus global bas-CSS (`body`, rubriker) |
| `src/app/app.material-icons.ts` | `provideMaterialIcons()`: ikonfonten som standard för `<mat-icon>` och egna SVG-ikoner via `svgIcon="namn"` från `public/assets/icons` |
| `src/app/app.routes.ts` | Routes: `/` (startsidan), `/skapa` (formuläret), `/inlagg` och `/inlagg/:anvandarId` (inlägg från ett test-API) och `/arenden/:id` (ett ärende), alla lazy-laddade |
| `src/app/start/` | Startsidan som visar temat på Material-komponenter |
| `src/app/skapa/` | Skapa-sidan: formulär med Angular Signal Forms, Material-select, textfält och datumväljare |
| `src/app/arende/` | `ArendeService` (POST `/api/arenden`), detaljsidan för ett ärende och `fejkBackendInterceptor` som svarar i stället för en riktig server |
| `src/app/inlagg/` | `InlaggService` med `httpResource` som tar en signal som parameter. `InlaggSida` listar användarna, `AnvandarensInlagg` visar inläggen för `:anvandarId` i URL:en |
| `src/app/fel/` | `httpFelInterceptor`: global felhantering som visar `FelDialog` (Material-dialog) när ett API-anrop misslyckas |
| `src/app/tema/tema.service.ts` | Växlar ljust, mörkt eller systemläge genom att sätta en klass på `<html>` |
| `src/app/app.scss` | Stilar för appens ram (toolbar och meny), använder bara `--mat-sys-*`-variabler |

### Byta färger

Färgerna motsvarar prebuilt-temat `azure-blue.css`: `primary: mat.$azure-palette` och `tertiary: mat.$blue-palette`. Andra prebuilt-teman fås genom att byta paletter, t.ex. `mat.$cyan-palette` + `mat.$orange-palette` för `cyan-orange`.

En helt egen palett genereras med `ng generate @angular/material:theme-color`.

### Det här visar demon

- **Inbyggda M3-paletter** (azure + blue) i `mat.theme((color: (primary: …, tertiary: …)))`.
- **Ljust och mörkt läge** med `color-scheme: light dark`. M3-temat använder `light-dark()`, så ett enda tema räcker för båda lägena.
- **Typografi**: endast Open Sans (Regular och SemiBold), laddas lokalt från `public/assets/fonts`.
- **Ikoner** via ikonfonten Material Symbols Outlined från npm-paketet `material-symbols`, serveras lokalt. Egna SVG-ikoner läggs i `public/assets/icons/` och används med `<mat-icon svgIcon="namn">`. Båda konfigureras med `provideMaterialIcons()` i `app.config.ts`.
- **Systemtokens** skrivs över med `mat.theme-overrides()` (hörnradier).
- **Komponenttokens** skrivs över med `mat.button-overrides()`, `mat.toolbar-overrides()`, `mat.card-overrides()`, `mat.fab-overrides()` och `mat.button-toggle-overrides()`.
- **Lokalt tema**: `.kompakt` anropar `mat.theme((density: -2))` för en del av sidan.
- **Egna komponenter** stylas med `var(--mat-sys-…)` så att de följer temat automatiskt.
- **Formulär med Signal Forms** på `/skapa`: `form()` med schema för validering (`required`, `minLength`, `email`, `min`/`max`, `minDate`), `[formField]` på Material-fälten och `[formRoot]` på `<form>` för att skicka. Datumväljaren använder `provideNativeDateAdapter()` med svenskt format. Efter lyckad sparning navigerar sidan till `/arenden/:id`, där `:id` blir en input på detaljsidan via `withComponentInputBinding()`. Om sparningen misslyckas visar `httpFelInterceptor` en feldialog och man stannar kvar med det ifyllda formuläret. Skriv "500" i titeln för att prova.
- **httpResource med parameter från URL:en** på `/inlagg/:anvandarId`: routern gör `:anvandarId` till `input.required<string>()` (via `withComponentInputBinding()`), och den signalen skickas rakt in i `InlaggService.inlagg(anvandarId)`. Byter man användare hämtas inläggen på nytt och ett pågående anrop avbryts. `parse` lägger till `antalOrd` på varje inlägg. Hämtas från [JSONPlaceholder](https://jsonplaceholder.typicode.com).
- **POST med HttpClient** på `/inlagg/:anvandarId`: formuläret "Nytt inlägg" (Signal Forms) anropar `InlaggService.skapa()`, som skickar `POST /posts`. Läsning görs med `httpResource`, skrivning med `HttpClient`. Det nya inlägget läggs först i listan med `update()` på resursen, eftersom JSONPlaceholder inte sparar på riktigt.
- **Tester med ng-mocks**: alla specar använder `MockBuilder`/`MockRender`. Material-komponenter mockas, det som testas behålls med `.keep()`. `src/test-setup.ts` gör mockade metoder till `vi.fn()` via `ngMocks.autoSpy('vitest')`.
