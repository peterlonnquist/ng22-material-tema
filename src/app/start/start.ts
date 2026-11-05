import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

export interface Avgang {
  linje: string;
  destination: string;
  minuter: number;
}

/** Startsidan: visar temat på ett urval av Material-komponenter. */
@Component({
  selector: 'app-start',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
  ],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly namn = signal('');
  protected readonly notiser = signal(true);
  protected readonly valdaTaggar = signal<string[]>(['Angular']);

  protected readonly taggar = ['Angular', 'Material', 'Spring Boot', 'Oracle', 'Artemis'];
  protected readonly kolumner = ['linje', 'destination', 'minuter'];
  protected readonly avgangar: Avgang[] = [
    { linje: '17', destination: 'Åkeshov', minuter: 2 },
    { linje: '18', destination: 'Farsta strand', minuter: 5 },
    { linje: '19', destination: 'Hässelby strand', minuter: 9 },
  ];

  protected visaMeddelande(): void {
    const mottagare = this.namn().trim() || 'världen';
    this.snackBar.open(`Hej ${mottagare}!`, 'Stäng', { duration: 3000 });
  }
}
