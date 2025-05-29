import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-subir-imagenes',
  imports: [],
  templateUrl: './subir-imagenes.component.html',
  styleUrl: './subir-imagenes.component.css'
})
export class SubirImagenesComponent implements OnInit {

  archivoSeleccionado: File | null = null;
  idUsuario: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const datos = JSON.parse(usuario);
      this.idUsuario = datos.id;
    }
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  onSubmit() {
    if (!this.archivoSeleccionado || !this.idUsuario) {
      alert('Falta seleccionar imagen o no hay usuario autenticado.');
      return;
    }

    const formData = new FormData();
    formData.append('imagen', this.archivoSeleccionado);
    formData.append('id_usuario', this.idUsuario.toString());

    this.http.post<any>('http://localhost/Proyecto%20Integrado/backend/servicios.php?accion=SubirImagen', formData)
      .subscribe({
        next: res => {
          if (res.success) {
            alert('Imagen subida con éxito.');
          } else {
            alert('Error del servidor: ' + res.error);
          }
        },
        error: err => {
          console.error(err);
          alert('Error en la subida.');
        }
      });
  }
}
