import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./detalle-usuario.component.css']
})
export class DetalleUsuarioComponent implements OnInit {
  usuario: Usuario = {
    id: 0,
    nombre: '',
    email: '',
    password: '',
    rol: ''
  };
  imagenes: Imagen[] = [];

  constructor(
    private servicioUsuario: UsuarioService, 
    private router: Router, 
    private route: ActivatedRoute, 
    private servicioImagen: ImagenService,
  ) { }

  ngOnInit(): void {
    const id_usuario = parseInt(this.route.snapshot.params["id"]);

    if (!id_usuario) {
      console.error('No se proporcionó ID de usuario');
      this.router.navigate(['/usuarios']);
      return;
    }

    this.cargarDatosUsuario(id_usuario);
    this.cargarImagenesUsuario(id_usuario);
  }

  cargarDatosUsuario(id_usuario: number) {
    this.servicioUsuario.ObtenerIdUsuario(id_usuario).subscribe({
      next: (data) => {
        if (data) {
          this.usuario = data;
        } else {
          console.error('No se encontró el usuario con ID:', id_usuario);
          this.router.navigate(['/usuarios']);
        }
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.router.navigate(['/usuarios']);
      }
    });
  }

  cargarImagenesUsuario(id_usuario: number) {
    this.servicioImagen.ObtenerImagenesPorUsuario(id_usuario).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.imagenes = data.map(img => ({
            ...img,
            titulo: img.titulo || 'Sin título',
            ruta: img.ruta || ''
          }));
          console.log('Imágenes del usuario cargadas:', this.imagenes.length);
        } else {
          console.error('La respuesta no es un array:', data);
          this.imagenes = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar las imágenes del usuario:', error);
        this.imagenes = [];
      }
    });
  }


  volver() {
    this.router.navigate(['/usuarios']);
  }

  validar(id_imagen: number) {
    this.router.navigate(['/validar', id_imagen]);
  }
}
