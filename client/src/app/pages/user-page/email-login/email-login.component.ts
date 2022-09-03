import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services';
import { LoginFormType } from 'src/enums';

const emailFormGroup = {
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  passwordConfirm: ['', []],
};

@Component({
  selector: 'app-email-login',
  templateUrl: './email-login.component.html',
  styleUrls: ['./email-login.component.scss'],
})
export class EmailLoginComponent {
  form: FormGroup;
  type: LoginFormType = LoginFormType.LOGIN;
  loading = false;
  serverMessage: string = '';

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.form = this.fb.group(emailFormGroup);
  }

  changeType(val: LoginFormType) {
    this.form.reset();
    this.type = val;
  }

  async onSubmit() {
    this.loading = true;
    const email = this.email?.value;
    const password = this.password?.value;
    try {
      if (this.isLogin) {
        await this.authService.signinWithEmailPassword(email, password);
      }
      if (this.isSignup) {
        await this.authService.signupWithEmailPassword(email, password);
      }
    } catch (err: any) {
      this.serverMessage = err?.message || 'Request failed!';
    }
    this.loading = false;
  }

  public get LoginFormType(): typeof LoginFormType {
    return LoginFormType;
  }

  get isLogin() {
    return this.type === LoginFormType.LOGIN;
  }

  get isSignup() {
    return this.type === LoginFormType.SIGNUP;
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get passwordConfirm() {
    return this.form.get('passwordConfirm');
  }

  get passwordsMatch() {
    return (
      this.type !== LoginFormType.SIGNUP ||
      this.password?.value === this.passwordConfirm?.value
    );
  }
}
