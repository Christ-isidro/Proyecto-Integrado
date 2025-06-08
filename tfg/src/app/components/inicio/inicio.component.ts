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
    this.imagenService.ListarImagenesAdmitidas().subscribe({
      next: (data) => {
        console.log('Imágenes admitidas:', data);
        this.imagenesAdmitidas = data.map(img => ({
          ...img,
          titulo: img.titulo || 'Sin título',
          votos: img.votos || 0
        }));
        this.imagenesRanking = [...this.imagenesAdmitidas].sort((a, b) => (b.votos || 0) - (a.votos || 0));
      },
      error: (error) => {
        console.error("Error al cargar las imágenes admitidas:", error);
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
