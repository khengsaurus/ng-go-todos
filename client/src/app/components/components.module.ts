import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Board } from './board/board.component';
import { TodoCard } from './cards/todo-card.component';
import { ConfirmButton } from './confirm-button.component';
import {
  NewBoardDialog,
  PreviewTodoDialog,
  SelectBoardDialog,
} from './dialogs';
import { PrioritySelect } from './form/priority-select.component';
import { MarkdownViewer } from './markdown-viewer/markdown-viewer.component';
import { AppShell } from './shell/shell.component';
import { TodoEditor } from './todo-editor/todo-editor.component';

const imports = [
  CommonModule,
  DragDropModule,
  FormsModule,
  LayoutModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule,
  ReactiveFormsModule,
  RouterModule,
];

const declarations = [
  AppShell,
  Board,
  ConfirmButton,
  MarkdownViewer,
  NewBoardDialog,
  PreviewTodoDialog,
  PrioritySelect,
  SelectBoardDialog,
  TodoCard,
  TodoEditor,
];

@NgModule({
  imports,
  declarations,
  exports: [...imports, ...declarations],
})
export class ComponentsModule {}
