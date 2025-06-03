import { Injectable } from '@angular/core';
import { HttpClient, withRequestsMadeViaParent } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Imagen } from '../models/imagen';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private url: string = environment.url
  constructor(private http: HttpClient) { }

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
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

  SubirImagen(file: File, id_usuario: number, titulo: string, descripcion: string) {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('accion', 'SubirImagen');
    return this.http.post(this.url, formData)
  }

  eliminarImagen(id_imagen: number) {
    let p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post<Imagen>(this.url, p);
  }

  CambiarEstadoImagen(id_imagen: number, estado: string) {
    let p = JSON.stringify({
      accion: "CambiarEstadoImagen",
      id_imagen: id_imagen,
      estado: estado,
    });
    return this.http.post<Imagen>(this.url, p);
  }


}
