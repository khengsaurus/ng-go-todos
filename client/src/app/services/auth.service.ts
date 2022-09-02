import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUserEmail$: Observable<string>;
  currentUserEmail: string;
  userLoggedIn: boolean;

  constructor(public afAuth: AngularFireAuth) {
    this.currentUserEmail$ = new Observable();
    this.currentUserEmail = '';
    this.userLoggedIn = false;
    this.initAuthListener();
  }

  private initAuthListener() {
    this.currentUserEmail$ = this.afAuth.authState.pipe(
      map((user) => user?.email || '')
    );
    this.currentUserEmail$.subscribe((email) => {
      console.log('should set ' + email);
      this.currentUserEmail = email;
      this.userLoggedIn = Boolean(email);
    });
  }

  signinWithGoogle() {
    this.afAuth.signInWithPopup(new GoogleAuthProvider());
  }

  signinWithEmailPassword(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signupWithEmailPassword(email: string, password: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  resetPassword(email: string) {
    this.afAuth.sendPasswordResetEmail(email);
  }

  logout() {
    this.afAuth.signOut();
  }
}
