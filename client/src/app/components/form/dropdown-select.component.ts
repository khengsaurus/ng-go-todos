import { Component, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'dropdown-select',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    },
  ],
  template: `
    <div class="btn-m dropdown-select">
      <p class="label">{{ label }}</p>
      <mat-form-field appearance="standard" [ngStyle]="{ width: '30px' }">
        <mat-select formControlName="{{ controlName }}">
          <mat-option *ngFor="let val of options" [value]="val">{{
            val
          }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['form.scss'],
})
export class DropdownSelect {
  @Input() label!: string;
  @Input() controlName!: string;
  @Input() options!: Array<string | number>;

  constructor() {}
}
