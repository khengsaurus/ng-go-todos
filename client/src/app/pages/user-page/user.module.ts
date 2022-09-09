import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { EmailLogin } from './email-login/email-login.component';
import { ProfilePage } from './profile-page/profile-page.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [ProfilePage, EmailLogin],
  imports: [
    CommonModule,
    ComponentsModule,
    ReactiveFormsModule,
    UserRoutingModule,
  ],
})
export class UserModule {}
