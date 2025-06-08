import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImagenService } from '../../services/imagen.service';
import { Imagen } from '../../models/imagen';

@Component({
  selector: 'app-participante',
  imports: [RouterLink],
  templateUrl: './participante.component.html',
  styleUrls: ['./participante.component.css']
})
export class ParticipanteComponent implements OnInit {
  imagenes: Imagen[] = [];
  usuario: any;

  constructor(
    private router: Router,
    private imagenServicio: ImagenService
  ) {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.cargarImagenes();
  }

  cargarImagenes(): void {
    if (!this.usuario?.id) {
      console.error('No hay ID de usuario');
      return;
    }

    this.imagenServicio.ObtenerImagenesPorUsuario(this.usuario.id).subscribe({
      next: (data) => {
        this.imagenes = data.map(img => ({
          ...img,
          titulo: img.titulo || 'Sin título',
          ruta: img.ruta || '',
          estado: img.estado || 'pendiente'
        }));
        console.log("Imágenes cargadas: ", this.imagenes);
      },
      error: (error) => {
        console.error("Error al cargar las imágenes: ", error);
        alert("No se han podido cargar las imágenes");
      }
    });
  }

  volverLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  subirImagen(id: number): void {
    this.router.navigate(['/subir-imagen', id]);
  }

  eliminarImagen(id_imagen: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      this.imagenServicio.eliminarImagen(id_imagen).subscribe({
        next: () => {
          this.cargarImagenes();
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
          alert('Error al eliminar la imagen');
        }
      });
    }
  }

  getImageUrl(base64String: string): string {
    return this.imagenServicio.getImageUrl(base64String);
  }
}
