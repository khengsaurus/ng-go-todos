import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentFbUser$: Observable<firebase.default.User | undefined>;
  userLoggedIn: boolean;

  constructor(public afAuth: AngularFireAuth) {
    this.userLoggedIn = false;
    this.currentFbUser$ = this.afAuth.authState.pipe(
      map((user) => {
        const email = user?.email || '';
        this.userLoggedIn = Boolean(email);
        return user || undefined;
      })
    );
    this.currentFbUser$.subscribe();
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
