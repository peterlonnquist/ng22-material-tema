import { TestBed } from '@angular/core/testing';
import { Start } from './start';

describe('Start', () => {
  it('visar rubriken', async () => {
    const fixture = TestBed.createComponent(Start);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Eget Material 3-tema');
  });
});
