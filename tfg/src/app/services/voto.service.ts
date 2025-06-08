import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface VotoResponse {
  success: boolean;
  accion?: 'added' | 'removed';
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VotoService {
  private url = environment.apiUrl;
  private votosSubject = new BehaviorSubject<{[key: number]: boolean}>({});
  votos$ = this.votosSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar votos del usuario actual al iniciar
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.id) {
      this.cargarVotosUsuario(usuario.id);
    }
  }

  private cargarVotosUsuario(idUsuario: number) {
    this.obtenerVotosPorUsuario(idUsuario).subscribe(votos => {
      const votosMap: {[key: number]: boolean} = {};
      votos.forEach((idImagen: number) => {
        votosMap[idImagen] = true;
      });
      this.votosSubject.next(votosMap);
    });
  }

  registrarVoto(idUsuario: number, idImagen: number): Observable<VotoResponse> {
    const datos = {
      accion: 'RegistrarVoto',
      id_usuario: idUsuario,
      id_imagen: idImagen
    };

    return this.http.post<VotoResponse>(`${this.url}/servicios.php`, JSON.stringify(datos)).pipe(
      map(response => {
        const votosActuales = this.votosSubject.value;
        if (response.accion === 'added') {
          votosActuales[idImagen] = true;
        } else {
          delete votosActuales[idImagen];
        }
        this.votosSubject.next(votosActuales);
        return response;
      })
    );
  }

  obtenerVotosImagen(idImagen: number): Observable<number> {
    const datos = {
      accion: 'ObtenerVotosImagen',
      id_imagen: idImagen
    };
    return this.http.post<number>(`${this.url}/servicios.php`, JSON.stringify(datos));
  }

  verificarVotoUsuario(idUsuario: number, idImagen: number): Observable<boolean> {
    const datos = {
      accion: 'VerificarVotoUsuario',
      id_usuario: idUsuario,
      id_imagen: idImagen
    };
    return this.http.post<boolean>(`${this.url}/servicios.php`, JSON.stringify(datos));
  }

  obtenerVotosPorUsuario(idUsuario: number): Observable<number[]> {
    const datos = {
      accion: 'ObtenerVotosPorUsuario',
      id_usuario: idUsuario
    };
    return this.http.post<number[]>(`${this.url}/servicios.php`, JSON.stringify(datos));
  }

  haVotado(idImagen: number): boolean {
    return this.votosSubject.value[idImagen] || false;
  }
} 