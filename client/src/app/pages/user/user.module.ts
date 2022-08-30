import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { EmailLoginComponent } from './email-login/email-login.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [
    ProfilePageComponent,
    ProfilePageComponent,
    EmailLoginComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    ReactiveFormsModule,
    UserRoutingModule,
  ],
})
export class UserModule {}
