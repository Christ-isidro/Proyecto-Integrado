import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImagenService } from '../../services/imagen.service';
import { Imagen } from '../../models/imagen';

@Component({
  selector: 'app-validar-imagenes',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './validar-imagenes.component.html',
  styleUrl: './validar-imagenes.component.css'
})
export class ValidarImagenesComponent implements OnInit {
  form: FormGroup;
  imagen: Imagen = {
    id_imagen: 0,
    titulo: '',
    id_usuario: 0,
    ruta: '',
    estado: 'pendiente'
  };

  constructor(
    private fb: FormBuilder,
    private servicio: ImagenService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      estado: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      // Cargar la imagen específica
      this.servicio.ListarImagenes().subscribe({
        next: (imagenes) => {
          const imagenEncontrada = imagenes.find(img => img.id_imagen === parseInt(id));
          if (imagenEncontrada) {
            this.imagen = imagenEncontrada;
            this.form.patchValue({
              estado: this.imagen.estado
            });
          } else {
            console.error('Imagen no encontrada');
            this.router.navigate(['/imagenes']);
          }
        },
        error: (error) => {
          console.error('Error al cargar la imagen:', error);
          this.router.navigate(['/imagenes']);
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    
    console.log('Formulario enviado:', this.form.value);
    this.servicio.ValidarImagen(this.imagen.id_imagen, this.form.value.estado).subscribe({
      next: (res) => {
        console.log('Imagen validada correctamente:', res);
        alert('Imagen validada correctamente');
        this.router.navigate(['/imagenes']);
      },
      error: (err) => {
        console.error('Error al validar imagen:', err);
        alert('Error al validar imagen');
      }
    });
  }

  getImageUrl(base64String: string): string {
    return this.servicio.getImageUrl(base64String);
  }

  volver() {
    this.router.navigate(['/imagenes']);
  }
}