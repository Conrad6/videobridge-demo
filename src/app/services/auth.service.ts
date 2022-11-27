import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IPrincipal } from './principal.interface';
import { default as decode } from 'jwt-decode';

const key = 'JWT_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly principalSubject: BehaviorSubject<IPrincipal | null>;
  constructor() {
    this.principalSubject = new BehaviorSubject<IPrincipal | null>(this.readPrincipal());
  }

  get principal$() {
    return this.principalSubject.asObservable();
  }

  private readPrincipal() {
    const token = sessionStorage.getItem(key);
    if (!token) return null;
    const principal = decode(token) as IPrincipal;
    return principal;
  }
}
