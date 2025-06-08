import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagenService } from '../../services/imagen.service';
import { Imagen } from '../../models/imagen';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-validar-imagenes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './validar-imagenes.component.html',
  styleUrls: ['./validar-imagenes.component.css']
})
export class ValidarImagenesComponent implements OnInit {
  form: FormGroup;
  imagen: Imagen = {
    id_imagen: 0,
    titulo: '',
    ruta: '',
    estado: '',
    id_usuario: 0,
    nombre_usuario: '',
    votos: 0
  };

  constructor(
    private servicio: ImagenService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      estado: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id_imagen'];
    if (!id) {
      console.error('No se proporcionó ID de imagen');
      this.router.navigate(['/imagenes']);
      return;
    }

    console.log('ID de imagen a validar:', id);

    this.servicio.ListarImagenes().subscribe({
      next: (imagenes) => {
        if (!Array.isArray(imagenes)) {
          console.error('La respuesta no es un array:', imagenes);
          return;
        }

        const imagen = imagenes.find(img => img.id_imagen === parseInt(id));
        if (imagen) {
          console.log('Imagen encontrada:', imagen);
          this.imagen = {
            ...imagen,
            titulo: imagen.titulo || 'Sin título',
            ruta: imagen.ruta || '',
            estado: imagen.estado || 'pendiente'
          };
          this.form.patchValue({ estado: this.imagen.estado });
        } else {
          console.error('No se encontró la imagen con ID:', id);
          this.router.navigate(['/imagenes']);
        }
      },
      error: (error) => {
        console.error('Error al cargar la imagen:', error);
        this.router.navigate(['/imagenes']);
      }
    });
  }

  onSubmit() {
    if (this.form.valid && this.imagen.id_imagen) {
      console.log('Enviando validación - ID:', this.imagen.id_imagen, 'Estado:', this.form.get('estado')?.value);
      const estado = this.form.get('estado')?.value;
      this.servicio.ValidarImagen(this.imagen.id_imagen, estado).subscribe({
        next: (response) => {
          console.log('Imagen validada:', response);
          this.router.navigate(['/imagenes']);
        },
        error: (error) => {
          console.error('Error al validar la imagen:', error);
        }
      });
    } else {
      console.error('Formulario inválido o ID de imagen no disponible');
    }
  }

}