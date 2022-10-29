import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

const uri = environment.production
  ? environment.prodRestApi
  : environment.devRestApi;

const config = {
  headers: { Authorization: 'Bearer -' },
};

@Injectable({ providedIn: 'root' })
export class FilesService {
  constructor(private http: HttpClient, private userService: UserService) {}

  getSignedPutURL$(todoId?: string, fileName = 'file-name') {
    const userId = this.userService.currentUser?.id;
    if (!todoId || !userId) return null;
    return this.http.post(uri, { userId, todoId, fileName }, config);
  }
}
