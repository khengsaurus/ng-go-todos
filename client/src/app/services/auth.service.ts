import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { IUser } from 'src/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user: IUser | null;
  userLoggedIn: boolean;

  constructor(public afAuth: AngularFireAuth) {
    this.user = null;
    this.userLoggedIn = true;
    this.afAuth.authState.subscribe((user) => {
      // TODO: get user doc on login
      // this.user = user?.email ? { email: user.email } : null;
      this.userLoggedIn = Boolean(user);
    });
  }

  signinWithGoogle() {
    return this.afAuth.signInWithPopup(new GoogleAuthProvider());
  }

  signinWithEmailPassword(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signupWithEmailPassword(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  logout() {
    return this.afAuth.signOut();
  }
}
