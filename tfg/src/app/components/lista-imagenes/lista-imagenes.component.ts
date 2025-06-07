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

  cargarImagenes(): void {
    this.imagenService.ListarImagenes().subscribe({
      next: (data: Imagen[]) => {
        this.imagenes = data;
      },
      error: (error: any) => {
        console.error('Error al cargar imágenes:', error);
      }
    });
  }

  validar(id: number, estado: string): void {
    this.imagenService.ValidarImagen(id, estado).subscribe({
      next: () => {
        this.cargarImagenes();
      },
      error: (error: any) => {
        console.error('Error al validar imagen:', error);
      }
    });
  }

  eliminarImagen(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      this.imagenService.eliminarImagen(id).subscribe({
        next: () => {
          this.cargarImagenes();
        },
        error: (error: any) => {
          console.error('Error al eliminar imagen:', error);
        }
      });
    }
  }
}
