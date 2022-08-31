import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const uri = environment.production
  ? environment.prodApiURL
  : environment.devApiURL;

@Injectable({ providedIn: 'root' })
export class HTTPService {
  constructor(private http: HttpClient) {}

  _options = {
    headers: { Authorization: 'Bearer -' },
  };

  test() {
    const url = `${uri}/test`;
    return this.http.get(url, this._options);
  }
}
