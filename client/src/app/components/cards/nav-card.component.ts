import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'nav-card',
  templateUrl: './nav-card.component.html',
  styleUrls: ['./cards.scss'],
})
export class NavCard {
  @Input() title: string | undefined;
  @Input() href: string | undefined;

  constructor(private router: Router) {}

  handleClick() {
    if (this.href) this.router.navigateByUrl(this.href);
  }
}
