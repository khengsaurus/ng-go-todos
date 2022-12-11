import { Component, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'dropdown-select',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['form.scss'],
})
export class DropdownSelect {
  @Input() label!: string;
  @Input() formControlName!: string;
  @Input() options!: Array<string | number>;
}
