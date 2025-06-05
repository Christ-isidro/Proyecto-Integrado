import { Component } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Imagen } from '../../models/imagen';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

  imagenesAdmitidas: Imagen[] = [];
  idUsuario = localStorage.getItem('usuario');

  constructor(private imagenService: ImagenService, private router: Router) {
    this.imagenService.ListarImagenesAdmitidas().subscribe({
      next: (data) => {
        console.log(data);
        this.imagenesAdmitidas = data;
      }
      , error: (error) => {
        console.error("Error al cargar las imágenes admitidas:", error);
      }
    });
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

  votarImagen(idImagen: number) {
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
    if (!votos.includes(idImagen)) {
      votos.push(idImagen);
      localStorage.setItem(clave, JSON.stringify(votos));
    }
  }

  // Para saber si ya votó una imagen:
  yaVotada(idImagen: number): boolean {
    // Obtiene el id del usuario logueado desde localStorage (si existe)
    const idUsuario = this.idUsuario ? JSON.parse(this.idUsuario).id : null;
    // Crea la clave única para este usuario
    const clave = `votosRally_${idUsuario}`;
    // Obtiene el array de votos del usuario desde localStorage (o un array vacío si no hay nada)
    let votos = JSON.parse(localStorage.getItem(clave) || '[]');
    // Devuelve true si el id de la imagen está en el array de votos, false si no
    return votos.includes(idImagen);
  }

}
