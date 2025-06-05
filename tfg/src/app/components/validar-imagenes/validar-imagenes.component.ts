import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Imagen } from '../../models/imagen';
import { ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-validar-imagenes',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './validar-imagenes.component.html',
  styleUrl: './validar-imagenes.component.css'
})
export class ValidarImagenesComponent {

  public imagen: Imagen = <Imagen>{};
  public form: FormGroup;

  constructor(private fb: FormBuilder, private ar: ActivatedRoute, private router: Router, private servicio: ImagenService) {
    this.form = this.fb.group({
      estado: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id_imagen = this.ar.snapshot.params['id_imagen'];

    console.log('ID de imagen recibido:', id_imagen);

    this.servicio.ListarImagenes().subscribe({
      next: (imagenes) => {
        // Busca la imagen por id
        const encontrada = imagenes.find((img: Imagen) => img.id_imagen == id_imagen);
        if (encontrada) {
          this.imagen = encontrada;
          // Opcional: poner el estado actual en el formulario
          this.form.patchValue({ estado: this.imagen.estado });
        } else {
          alert('Imagen no encontrada');
          this.router.navigate(['/imagenes']);
        }
      },
      error: () => {
        alert('Error al cargar la imagen');
        this.router.navigate(['/imagenes']);
      }
    });
  }

  onSubmit() {
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
    })
  }
}