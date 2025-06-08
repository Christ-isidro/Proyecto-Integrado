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
  ) {
    this.imagenService.ListarImagenesAdmitidas().subscribe({
      next: (data) => {
        console.log(data);
        this.imagenesAdmitidas = data;
        // Calcular el ranking de imágenes al cargar las admitidas
        this.calcularRanking();
      }
      , error: (error) => {
        console.error("Error al cargar las imágenes admitidas:", error);
      }
    });
  }

  ngOnInit(): void {
    this.cargarVotosUsuario();
  }

  volverLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  miPerfil() {
    // Obtiene el id del usuario logueado desde localStorage (si existe)
    const idUsuario = this.idUsuario ? JSON.parse(this.idUsuario).id : null;
    // Si no hay usuario logueado, muestra un mensaje y no permite acceder al perfil
    if (!idUsuario) {
      alert('Debes iniciar sesión para ver tu perfil');
      // Redirige al login
      this.router.navigate(['/']);
      return;
    }
    // Redirige al perfil del usuario
    this.router.navigate(['/perfil']);
  }

  votarImagen(id_imagen: number) {
    // Obtiene el id del usuario logueado desde localStorage (si existe)
    const idUsuario = this.idUsuario ? JSON.parse(this.idUsuario).id : null;
    // Si no hay usuario logueado, muestra un mensaje y no permite votar
    if (!idUsuario) {
      alert('Debes iniciar sesión para votar');
      return;
    }
    // Crea una clave única para guardar los votos de este usuario en localStorage
    const clave = `votosRally_${idUsuario}`;
    // Obtiene el array de votos del usuario desde localStorage (o un array vacío si no hay nada)
    let votos = JSON.parse(localStorage.getItem(clave) || '[]');
    // Si el usuario no ha votado aún por esta imagen, la añade al array y lo guarda
    if (!votos.includes(id_imagen)) {
      votos.push(id_imagen);
      localStorage.setItem(clave, JSON.stringify(votos));
    }
  }

  // Para saber si ya votó una imagen:
  yaVotada(id_imagen: number): boolean {
    // Obtiene el id del usuario logueado desde localStorage (si existe)
    const idUsuario = this.idUsuario ? JSON.parse(this.idUsuario).id : null;
    // Crea la clave única para este usuario
    const clave = `votosRally_${idUsuario}`;
    // Obtiene el array de votos del usuario desde localStorage (o un array vacío si no hay nada)
    let votos = JSON.parse(localStorage.getItem(clave) || '[]');
    // Devuelve true si el id de la imagen está en el array de votos, false si no
    return votos.includes(id_imagen);
  }

  calcularRanking() {
    /**
     * Esta función calcula el ranking de imágenes más votadas.
     * - Inicializa un contador de votos para cada imagen admitida.
     * - Recorre todas las claves de localStorage que empiezan por 'votosRally_' (votos de cada usuario).
     * - Suma los votos de cada imagen (cada usuario puede votar por varias imágenes, pero solo una vez por imagen).
     * - Añade el campo 'votos' a cada imagen.
     * - Ordena las imágenes por número de votos de mayor a menor.
     * - Guarda el top 3 en 'imagenesRanking' (puedes quitar el '.slice(0, 3)' si quieres mostrar todas).
     */
    // Inicializa votos en 0 para cada imagen
    const votosPorImagen: { [id: number]: number } = {};
    this.imagenesAdmitidas.forEach(img => votosPorImagen[img.id_imagen] = 0);

    // Recorre todas las claves de localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave && clave.startsWith('votosRally_')) {
        try {
          const votos: number[] = JSON.parse(localStorage.getItem(clave) || '[]');
          votos.forEach(idImg => {
            if (votosPorImagen[idImg] !== undefined) {
              votosPorImagen[idImg]++;
            }
          });
        } catch { }
      }
    }

    // Añade el campo votos a cada imagen y ordena
    this.imagenesRanking = this.imagenesAdmitidas
      .map(img => ({ ...img, votos: votosPorImagen[img.id_imagen] || 0 }))
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 3); // Top 3, quita esto si quieres mostrar todas
  }

  getImageUrl(ruta: string): string {
    return this.imagenService.getImageUrl(ruta);
  }

  cargarVotosUsuario() {
    // Implementa la lógica para cargar los votos del usuario desde localStorage
  }

}
