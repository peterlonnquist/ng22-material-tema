import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { InlaggService } from './inlagg.service';

/**
 * Inläggssidan, /inlagg: användarna som länkar. Vald användares inlägg visas
 * i <router-outlet> av AnvandarensInlagg, på /inlagg/:anvandarId.
 */
@Component({
  selector: 'app-inlagg-sida',
  imports: [MatButton, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './inlagg-sida.html',
  styleUrl: './inlagg-sida.scss',
})
export class InlaggSida {
  protected readonly anvandare = inject(InlaggService).anvandare();
}
