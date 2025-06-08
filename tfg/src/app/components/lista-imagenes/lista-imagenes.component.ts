import { Component, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Router } from '@angular/router';
import { Imagen } from '../../models/imagen';

@Component({
  selector: 'app-lista-imagenes',
  templateUrl: './lista-imagenes.component.html',
  styleUrls: ['./lista-imagenes.component.css']
})
export class ListaImagenesComponent implements OnInit {
  imagenes: Imagen[] = [];

  constructor(
    private imagenService: ImagenService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarImagenes();
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }

  cargarImagenes() {
    this.imagenService.ListarImagenes().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.imagenes = data.map(img => ({
            ...img,
            titulo: img.titulo || 'Sin título',
            ruta: img.ruta || ''
          }));
        } else {
          console.error('La respuesta no es un array:', data);
          this.imagenes = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar imágenes:', error);
        this.imagenes = [];
      }
    });
  }

  validar(id_imagen: number) {
    this.router.navigate(['/validar', id_imagen]);
  }

  eliminarImagen(id_imagen: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.imagenService.eliminarImagen(id_imagen).subscribe({
        next: (response) => {
          console.log('Imagen eliminada:', response);
          this.cargarImagenes();
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
        }
      });
    }
  }
}
