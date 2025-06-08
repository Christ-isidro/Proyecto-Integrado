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
  votosUsuario: number[] = [];
  private usuario: any = null;

  constructor(
    private imagenService: ImagenService, 
    private router: Router,
  ) { 
    // Initialize user data from localStorage
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      try {
        this.usuario = JSON.parse(usuarioData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

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
          // Verificar si la ruta es base64
          const ruta = img.ruta || '';
          console.log('Procesando imagen:', {
            id: img.id_imagen,
            titulo: img.titulo,
            rutaLength: ruta.length,
            rutaStart: ruta.substring(0, 50) + '...',
            isBase64: ruta.startsWith('data:image/')
          });

          return {
            ...img,
            titulo: img.titulo || 'Sin título',
            votos: parseInt(img.votos) || 0,
            ruta: ruta
          };
        });

        console.log('Imágenes procesadas:', this.imagenesAdmitidas.length);
        this.imagenesRanking = [...this.imagenesAdmitidas]
          .sort((a, b) => (b.votos || 0) - (a.votos || 0));
        console.log('Ranking generado:', this.imagenesRanking.length);
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
    if (this.usuario?.id) {
      this.imagenService.obtenerVotosUsuario(this.usuario.id).subscribe({
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
    if (!this.usuario?.id) {
      alert('Debes iniciar sesión para ver tu perfil');
      this.router.navigate(['/']);
      return;
    }
    this.router.navigate(['/perfil']);
  }

  votarImagen(id_imagen: number) {
    console.log('Intentando votar imagen:', id_imagen);
    
    if (!this.usuario?.id) {
      alert('Debes iniciar sesión para votar');
      return;
    }

    // Validar que los IDs sean números válidos
    const idImagenNum = Number(id_imagen);
    const idUsuarioNum = Number(this.usuario.id);

    if (isNaN(idImagenNum) || idImagenNum <= 0) {
      console.error('ID de imagen inválido:', id_imagen);
      alert('Error: ID de imagen inválido');
      return;
    }

    if (isNaN(idUsuarioNum) || idUsuarioNum <= 0) {
      console.error('ID de usuario inválido:', this.usuario.id);
      alert('Error: ID de usuario inválido');
      return;
    }

    console.log('Enviando voto - Usuario:', idUsuarioNum, 'Imagen:', idImagenNum);

    this.imagenService.votarImagen(idImagenNum, idUsuarioNum).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
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
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('Error al registrar el voto');
        }
      }
    });
  }

  yaVotada(id_imagen: number): boolean {
    return Array.isArray(this.votosUsuario) && this.votosUsuario.includes(id_imagen);
  }


}
