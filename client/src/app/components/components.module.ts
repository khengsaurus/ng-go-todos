import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Board } from './board/board.component';
import { TodoCard } from './cards/todo-card.component';
import { BoardForm, DropdownSelect } from './form';
import { ConfirmButton } from './confirm-button.component';
import {
  ConfirmDialog,
  NewBoardDialog,
  PreviewTodoDialog,
  SelectBoardDialog,
} from './dialogs';
import { FileComponent } from './file/file.component';
import { MarkdownViewer } from './markdown-viewer/markdown-viewer.component';
import { AppShell } from './shell/shell.component';
import { TodoEditor } from './todo-editor/todo-editor.component';

const imports = [
  CommonModule,
  DragDropModule,
  FormsModule,
  LayoutModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
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
  BoardForm,
  ConfirmButton,
  ConfirmDialog,
  FileComponent,
  MarkdownViewer,
  NewBoardDialog,
  PreviewTodoDialog,
  DropdownSelect,
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
