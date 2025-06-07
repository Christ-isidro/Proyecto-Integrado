import { Component } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Router, RouterLink } from '@angular/router';
import { Imagen } from '../../models/imagen';

@Component({
  selector: 'app-lista-imagenes',
  imports: [RouterLink],
  templateUrl: './lista-imagenes.component.html',
  styleUrl: './lista-imagenes.component.css'
})
export class ListaImagenesComponent {

  public imagenes: Imagen[] = [];

  constructor(private imagenService: ImagenService, private router: Router) {
    this.imagenService.ListarImagenes().subscribe({
      next: (data) => {
        console.log(data);
        this.imagenes = data;
      },
      error: (error) => {
        console.error("Error al cargar las imágenes:", error);
      }
    });
  }

  public eliminarImagen(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar esta imagen?')) {
      this.imagenService.eliminarImagen(id).subscribe({
        next: (data) => {
          console.log("Imagen eliminada");
          this.imagenService.ListarImagenes().subscribe({
            next: (imagenesActualizadas) => {
              this.imagenes = imagenesActualizadas;
              alert("Imagen eliminada correctamente");
            },
            error: (error) => {
              console.error("Error al actualizar la lista de imágenes: ", error);
              alert("No se ha podido actualizar la lista de imágenes");
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

  validar(id_imagen: number) {
    this.router.navigate(['/validar', id_imagen]);
  }

}
