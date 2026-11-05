import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { Start } from './start';

describe('Start', () => {
  // Alla Material-komponenter och MatSnackBar mockas
  beforeEach(() => MockBuilder(Start).mock(MatSnackBar));

  it('visar rubriken', () => {
    MockRender(Start);
    expect(ngMocks.formatText(ngMocks.find('h1'))).toBe('Eget Material 3-tema');
  });

  it('visar en snackbar när man klickar på Säg hej', () => {
    MockRender(Start);
    const snackBar = TestBed.inject(MatSnackBar);

    ngMocks.click(ngMocks.find('mat-card-actions button'));

    expect(snackBar.open).toHaveBeenCalledWith('Hej världen!', 'Stäng', { duration: 3000 });
  });
});
