import { Component, TrackByFunction } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagenService } from '../../services/imagen.service';
import { Imagen } from '../../models/imagen';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-usuario',
  imports: [CommonModule],
  templateUrl: './detalle-usuario.component.html',
  styleUrl: './detalle-usuario.component.css'
})
export class DetalleUsuarioComponent {
  public usuario: Usuario = <Usuario>{};
  public imagenes: Imagen[] = [];

  constructor(private servicioUsuario: UsuarioService, private router: Router, private ar: ActivatedRoute, private servicioImagen: ImagenService) {
    let id_usuario = parseInt(this.ar.snapshot.params["id"]);

    if (id_usuario) {
      this.servicioUsuario.ObtenerIdUsuario(id_usuario).subscribe({
        next: (data) => {
          this.usuario = data;
        },
        error: (error) => {
          console.log(error);
        }
      });
      this.servicioImagen.ObtenerImagenesPorUsuario(id_usuario).subscribe({
        next: (data) => {
          this.imagenes = data;
          console.log("Imágenes del usuario cargadas: ", data);
        },
        error: (error) => {
          console.log(error);
        }
      });

    }
  }


  volver() {
    this.router.navigate(['/usuarios']);
  }

  validar(id_imagen: number) {
    this.router.navigate(['/validar', id_imagen]);
  }

}
