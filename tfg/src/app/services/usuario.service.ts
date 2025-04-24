import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private url: string = environment.url;

  constructor(private http: HttpClient) { }

  ListarUsuarios() {
    let p = JSON.stringify({ accion: 'ListarUsuarios' });
    return this.http.post<Usuario[]>(this.url, p);
  }

  InserterUsuario(usuario: Usuario) {
    let p = JSON.parse(JSON.stringify(usuario));
    p.accion = 'InsertarUsuario';
    p.usuario = usuario;
    console.log(p);
    return this.http.post<Usuario[]>(this.url, JSON.stringify(p));
  }
}