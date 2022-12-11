import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import markdown from './markdown';

@Component({
  selector: 'markdown-viewer',
  template: `<div [innerHTML]="innerHTML" class="contents"></div>`,
  styleUrls: ['./markdown-viewer.component.scss'],
})
export class MarkdownViewer implements OnChanges {
  @Input() text: string = '';
  @Input() format: boolean = false;
  innerHTML: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const setFormat = changes['format']?.currentValue;
    if ((setFormat === undefined && this.format) || setFormat) {
      this.format = true;
      this.innerHTML = markdown(
        this.text || changes['text']?.currentValue || ''
      );
    } else {
      this.format = false;
      this.innerHTML = '';
    }
  }
}
