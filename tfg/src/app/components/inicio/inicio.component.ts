import { Component, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Imagen } from '../../models/imagen';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  imagenesAdmitidas: Imagen[] = [];
  imagenesRanking: Imagen[] = [];
  idUsuario = localStorage.getItem('usuario');
  votosUsuario: number[] = [];

  constructor(
    private imagenService: ImagenService, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cargarImagenesAdmitidas();
    this.cargarVotosUsuario();
  }

  cargarImagenesAdmitidas() {
    console.log('Iniciando carga de imágenes admitidas');
    this.imagenService.ListarImagenesAdmitidas().subscribe({
      next: (data) => {
        console.log('Datos recibidos de imágenes admitidas:', data);
        if (!Array.isArray(data)) {
          console.error('La respuesta no es un array:', data);
          this.imagenesAdmitidas = [];
          this.imagenesRanking = [];
          return;
        }

        this.imagenesAdmitidas = data.map(img => {
          console.log('Procesando imagen:', img);
          return {
            ...img,
            titulo: img.titulo || 'Sin título',
            votos: parseInt(img.votos) || 0,
            ruta: img.ruta || ''
          };
        });

        console.log('Imágenes procesadas:', this.imagenesAdmitidas);
        this.imagenesRanking = [...this.imagenesAdmitidas]
          .sort((a, b) => (b.votos || 0) - (a.votos || 0));
        console.log('Ranking generado:', this.imagenesRanking);
      },
      error: (error) => {
        console.error("Error al cargar las imágenes admitidas:", error);
        if (error.error) {
          console.error("Detalles del error:", error.error);
        }
        this.imagenesAdmitidas = [];
        this.imagenesRanking = [];
      }
    });
  }

  cargarVotosUsuario() {
    const usuario = this.idUsuario ? JSON.parse(this.idUsuario) : null;
    if (usuario && usuario.id) {
      this.imagenService.obtenerVotosUsuario(usuario.id).subscribe({
        next: (votos) => {
          console.log('Votos del usuario:', votos);
          this.votosUsuario = votos || [];
        },
        error: (error) => {
          console.error("Error al cargar los votos del usuario:", error);
          this.votosUsuario = [];
        }
      });
    } else {
      this.votosUsuario = [];
    }
  }

  volverLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  miPerfil() {
    const usuario = this.idUsuario ? JSON.parse(this.idUsuario) : null;
    if (!usuario || !usuario.id) {
      alert('Debes iniciar sesión para ver tu perfil');
      this.router.navigate(['/']);
      return;
    }
    this.router.navigate(['/perfil']);
  }

  votarImagen(id_imagen: number) {
    const usuario = this.idUsuario ? JSON.parse(this.idUsuario) : null;
    if (!usuario || !usuario.id) {
      alert('Debes iniciar sesión para votar');
      return;
    }

    this.imagenService.votarImagen(id_imagen, usuario.id).subscribe({
      next: (response) => {
        if (response && response.success) {
          // Actualizar la lista de votos del usuario
          this.cargarVotosUsuario();
          // Recargar las imágenes para actualizar el contador de votos
          this.cargarImagenesAdmitidas();
        } else {
          alert(response?.message || 'Error al registrar el voto');
        }
      },
      error: (error) => {
        console.error("Error al votar:", error);
        alert('Error al registrar el voto');
      }
    });
  }

  yaVotada(id_imagen: number): boolean {
    return Array.isArray(this.votosUsuario) && this.votosUsuario.includes(id_imagen);
  }

  getImageUrl(ruta: string): string {
    return this.imagenService.getImageUrl(ruta);
  }

}
