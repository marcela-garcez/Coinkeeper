import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pessoa {
  id: number;
  razaoSocial: string;
}

@Injectable({ providedIn: 'root' })
export class PessoasService {
  private readonly API = '/api/pessoas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Pessoa[]> {
    return this.http.get<Pessoa[]>(this.API);
  }

  buscar(id: number): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.API}/${id}`);
  }

  criar(data: Partial<Pessoa>): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.API, data);
  }

  atualizar(id: number, data: Partial<Pessoa>): Observable<Pessoa> {
    return this.http.put<Pessoa>(`${this.API}/${id}`, data);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
