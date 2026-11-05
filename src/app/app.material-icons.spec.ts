import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { provideMaterialIcons } from './app.material-icons';

describe('provideMaterialIcons', () => {
  // MatIcon och MatIconRegistry (i rotinjektorn) testas på riktigt
  // tillsammans med vår ikonkonfiguration
  beforeEach(() =>
    MockBuilder(MatIcon)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide(provideHttpClient())
      .provide(provideHttpClientTesting())
      .provide(provideMaterialIcons()),
  );

  it('använder ikonfonten Material Symbols Outlined som standard', () => {
    MockRender('<mat-icon>home</mat-icon>');
    expect(ngMocks.find('mat-icon').nativeElement.classList).toContain('material-symbols-outlined');
  });

  it('hämtar egna SVG-ikoner från /assets/icons', async () => {
    const fixture = MockRender('<mat-icon svgIcon="logo"></mat-icon>');
    const http = TestBed.inject(HttpTestingController);

    http
      .expectOne('/assets/icons/logo.svg')
      .flush('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>');
    await fixture.whenStable();

    // SVG:n läggs in direkt i DOM:en av MatIcon, så den söks i nativeElement
    const ikon = ngMocks.find('mat-icon').nativeElement as HTMLElement;
    expect(ikon.querySelector('svg')).not.toBeNull();
    http.verify();
  });
});
