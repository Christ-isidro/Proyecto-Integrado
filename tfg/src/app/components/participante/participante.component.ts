import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { Imagen } from '../../models/imagen';
import { ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-participante',
  imports: [],
  templateUrl: './participante.component.html',
  styleUrl: './participante.component.css'
})
export class ParticipanteComponent {

  public usuario: Usuario = <Usuario>{};
  public imagenes: Imagen[] = [];

  constructor(private router: Router, private imagenServicio: ImagenService) {

    const usuarioIniciado = localStorage.getItem('usuario');
    if (usuarioIniciado) {
      this.usuario = JSON.parse(usuarioIniciado);

      this.imagenServicio.ObtenerImagenesPorUsuario(this.usuario.id).subscribe({
        next: (data) => {
          this.imagenes = data;
          console.log("Imágenes cargadas: ", this.imagenes);
        },
        error: (error) => {
          console.error("Error al cargar las imágenes: ", error);
          alert("No se han podido cargar las imágenes");
        }
      });
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']); // Cambia a la ruta que corresponda en tu app
  }

  subirImagen(id: number) {
    this.router.navigate(['subir-imagen', id])
  }

  eliminarImagen(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar esta imagen?')) {
      this.imagenServicio.eliminarImagen(id).subscribe({
        next: (data) => {
          console.log("Imagen eliminada");
          // Actualizar la lista de imágenes después de eliminar
          this.imagenServicio.ObtenerImagenesPorUsuario(this.usuario.id).subscribe({
            next: (imagenes) => {
              this.imagenes = imagenes;
            },
            error: (error) => {
              console.error("Error al actualizar las imágenes: ", error);
            }
          });
        },
        error: (error) => {
          console.error("Error al eliminar la imagen: ", error);
          alert("No se ha podido eliminar la imagen");
        }
      });
    }
  }


}
