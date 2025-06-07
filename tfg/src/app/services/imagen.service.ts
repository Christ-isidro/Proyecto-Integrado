import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Imagen } from '../models/imagen';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private url: string = environment.url;
  
  constructor(private http: HttpClient) { }

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  ListarImagenesAdmitidas() {
    let p = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  ObtenerImagenesPorUsuario(id_usuario: number) {
    let p = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  SubirImagen(file: File, id_usuario: number, titulo: string) {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('titulo', titulo);
    formData.append('accion', 'SubirImagen');
    
    return this.http.post(this.url, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  eliminarImagen(id_imagen: number) {
    let p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post<Imagen>(this.url, p);
  }

  ValidarImagen(id_imagen: number, estado: string) {
    let p = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado,
    });
    return this.http.post<Imagen>(this.url, p);
  }
}
