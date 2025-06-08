import { Component, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { VotoService } from '../../services/voto.service';
import { Imagen } from '../../models/imagen';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface ImagenConVotos extends Imagen {
  votos?: number;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  imagenesAdmitidas: ImagenConVotos[] = [];
  imagenesRanking: ImagenConVotos[] = [];
  idUsuario: number | null = null;
  votosUsuario: Set<number> = new Set();
  cargandoVoto: { [key: number]: boolean } = {};

  constructor(
    private imagenService: ImagenService,
    private votoService: VotoService,
    private router: Router,
  ) {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.idUsuario = usuario.id;
    }
  }

  ngOnInit(): void {
    this.cargarImagenesAdmitidas();
    if (this.idUsuario) {
      this.cargarVotosUsuario();
    }
  }

  cargarImagenesAdmitidas() {
    this.imagenService.ListarImagenesAdmitidas().subscribe({
      next: (data) => {
        this.imagenesAdmitidas = data;
        this.cargarVotosPorImagen();
      },
      error: (error) => {
        console.error("Error al cargar las imágenes admitidas:", error);
      }
    });
  }

  async cargarVotosPorImagen() {
    try {
      const promesasVotos = this.imagenesAdmitidas.map(imagen =>
        firstValueFrom(this.votoService.obtenerVotosImagen(imagen.id_imagen))
      );

      const resultados = await Promise.all(promesasVotos);
      
      this.imagenesRanking = this.imagenesAdmitidas
        .map((imagen, index) => ({
          ...imagen,
          votos: resultados[index] || 0
        }))
        .sort((a, b) => (b.votos || 0) - (a.votos || 0))
        .slice(0, 3);
    } catch (error) {
      console.error('Error al cargar votos de imágenes:', error);
    }
  }

  volverLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  miPerfil() {
    if (!this.idUsuario) {
      alert('Debes iniciar sesión para ver tu perfil');
      this.router.navigate(['/']);
      return;
    }
    this.router.navigate(['/perfil']);
  }

  async votarImagen(id_imagen: number) {
    if (!this.idUsuario) {
      alert('Debes iniciar sesión para votar');
      return;
    }

    if (this.cargandoVoto[id_imagen]) {
      return; // Evitar múltiples clics mientras se procesa
    }

    this.cargandoVoto[id_imagen] = true;

    try {
      const response = await firstValueFrom(
        this.votoService.registrarVoto(this.idUsuario, id_imagen)
      );
      
      if (response?.success) {
        if (response.action === 'added') {
          this.votosUsuario.add(id_imagen);
        } else {
          this.votosUsuario.delete(id_imagen);
        }
        
        // Actualizar el conteo de votos y el ranking
        await this.cargarVotosPorImagen();
      }
    } catch (error) {
      console.error('Error al procesar el voto:', error);
      alert('Error al procesar el voto. Por favor, inténtalo de nuevo.');
    } finally {
      this.cargandoVoto[id_imagen] = false;
    }
  }

  yaVotada(id_imagen: number): boolean {
    return this.votosUsuario.has(id_imagen);
  }

  cargarVotosUsuario() {
    if (!this.idUsuario) return;

    this.votoService.obtenerVotosPorUsuario(this.idUsuario).subscribe({
      next: (votos) => {
        this.votosUsuario = new Set(votos);
      },
      error: (error) => {
        console.error('Error al cargar votos del usuario:', error);
      }
    });
  }

  getImageUrl(ruta: string): string {
    return this.imagenService.getImageUrl(ruta);
  }
}
