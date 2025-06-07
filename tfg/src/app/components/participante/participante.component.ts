import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { Imagen } from '../../models/imagen';
import { ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-participante',
  imports: [RouterLink],
  templateUrl: './participante.component.html',
  styleUrls: ['./participante.component.css']
})
export class ParticipanteComponent implements OnInit {
  public usuario: Usuario = <Usuario>{};
  public imagenes: Imagen[] = [];

  constructor(
    private router: Router, 
    private imagenServicio: ImagenService
  ) { }

  ngOnInit(): void {
    const usuarioIniciado = localStorage.getItem('usuario');
    if (usuarioIniciado) {
      this.usuario = JSON.parse(usuarioIniciado);
      this.cargarImagenes();
    }
  }

  cargarImagenes(): void {
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

  getImageUrl(ruta: string): string {
    return this.imagenServicio.getImageUrl(ruta);
  }

  editarPerfil(id: number): void {
    this.router.navigate(['/editar-perfil', id]);
  }

  subirImagen(id: number): void {
    this.router.navigate(['/subir-imagen', id]);
  }

  eliminarImagen(id: number): void {
    if (confirm('¿Estás seguro de que quieres borrar esta imagen?')) {
      this.imagenServicio.eliminarImagen(id).subscribe({
        next: () => {
          this.cargarImagenes();
          alert("Imagen eliminada correctamente");
        },
        error: (error) => {
          console.error("Error al eliminar la imagen: ", error);
          alert("No se ha podido eliminar la imagen");
        }
      });
    }
  }
}
