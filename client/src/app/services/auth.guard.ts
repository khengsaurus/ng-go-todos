import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from '.';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(): Promise<boolean> {
    return Boolean(this.userService.currentUser);
  }
}
