import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { IUser } from 'src/types';
import { GQLService } from './gql.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: IUser | null;
  userLoggedIn: boolean;

  constructor(public afAuth: AngularFireAuth, private gqlService: GQLService) {
    this.currentUser = null;
    this.userLoggedIn = false;
    this.initAuthListener();
  }

  private initAuthListener() {
    this.afAuth.authState.subscribe(async (user) => {
      const hasUser = Boolean(user);
      this.userLoggedIn = hasUser;
      if (hasUser && user?.email) {
        let _user: IUser | null = null;
        this.gqlService
          .getUser(user.email)
          .then(async (res: any) => {
            const existUser = res?.data?.getUser;
            if (existUser) {
              _user = existUser;
            } else {
              await this.gqlService
                .createUser(user.email!)
                .then((res) => (_user = res?.data?.createUser || null));
            }
          })
          .catch(console.error)
          .finally(() => (this.currentUser = _user));
      }
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
    this.currentUser = null;
    this.userLoggedIn = true;
  }
}
