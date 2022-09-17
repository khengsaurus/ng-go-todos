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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { Board } from './board/board.component';
import { TodoCard } from './cards/todo-card.component';
import { ConfirmButton } from './confirm-button.component';
import { BoardDialog } from './dialogs/board-dialog.component';
import { AppShell } from './shell/shell.component';
import { TodoEditor } from './todo-editor/todo-editor.component';

const components = [
  AppShell,
  Board,
  BoardDialog,
  ConfirmButton,
  TodoCard,
  TodoEditor,
];

const modules = [
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
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
  ReactiveFormsModule,
  RouterModule,
];

@NgModule({
  declarations: components,
  imports: modules,
  exports: [...modules, ...components],
})
export class ComponentsModule {}
