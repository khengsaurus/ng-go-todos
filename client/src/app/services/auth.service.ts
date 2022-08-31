import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { IUser } from 'src/types';
import { GQLService } from './gql.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user: IUser | null;
  userLoggedIn: boolean;

  constructor(public afAuth: AngularFireAuth, private gqlService: GQLService) {
    this.user = null;
    this.userLoggedIn = true;
    this.initAuthListener();
  }

  initAuthListener() {
    this.afAuth.authState.subscribe(async (user) => {
      const hasUser = Boolean(user);
      this.userLoggedIn = hasUser;
      if (hasUser && user?.email) {
        this.gqlService
          .getUser(user.email)
          .then((res: any) => {
            if (!res?.data?.getUser) {
              this.gqlService.createUser(user.email!);
            }
          })
          .catch(console.error);
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
  }
}
