import { Component, Input } from '@angular/core';

@Component({
  selector: 'priority-select',
  template: `
    <div class="btn priority-select">
      <p class="label">Priority:</p>
      <mat-form-field appearance="standard" [ngStyle]="{ width: '60px' }">
        <mat-select
          [value]="priority.toString()"
          [ngStyle]="{ paddingLeft: '2px' }"
          (selectionChange)="handleChange($event)"
        >
          <mat-option value="0">None</mat-option>
          <mat-option value="1">1</mat-option>
          <mat-option value="2">2</mat-option>
          <mat-option value="3">3</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['form.scss'],
})
export class PrioritySelect {
  @Input() priority!: number;
  @Input() handleChange!: (e: any) => void;

  constructor() {}
}
