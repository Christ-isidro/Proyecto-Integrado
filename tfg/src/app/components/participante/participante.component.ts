import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImagenService } from '../../services/imagen.service';
import { UsuarioService } from '../../services/usuario.service';
import { Imagen } from '../../models/imagen';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-participante',
  templateUrl: './participante.component.html',
  styleUrls: ['./participante.component.css']
})
export class ParticipanteComponent implements OnInit {
  imagenes: Imagen[] = [];
  usuario: Usuario = {
    id: 0,
    nombre: '',
    email: '',
    password: '',
    rol: ''
  };

  constructor(
    private imagenServicio: ImagenService,
    private usuarioServicio: UsuarioService,
    private router: Router
  ) {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      this.usuario = JSON.parse(usuarioData);
    }
  }

  ngOnInit(): void {
    if (!this.usuario.id) {
      this.router.navigate(['/']);
      return;
    }
    this.cargarImagenes();
  }

  cargarImagenes() {
    if (!this.usuario.id) return;

    this.imagenServicio.ObtenerImagenesPorUsuario(this.usuario.id).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.imagenes = data.map(img => ({
            ...img,
            titulo: img.titulo || 'Sin título',
            ruta: img.ruta || ''
          }));
          console.log('Imágenes cargadas:', this.imagenes.length);
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

  subirImagen(id_usuario: number) {
    this.router.navigate(['/subir-imagen', id_usuario]);
  }

  eliminarImagen(id_imagen: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.imagenServicio.eliminarImagen(id_imagen).subscribe({
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

  irAEditarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }


  editarPerfil(id: number): void {
    this.router.navigate(['/editar-perfil', id]);
  }
}
