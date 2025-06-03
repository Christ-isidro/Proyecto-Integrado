import { Component, inject, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-subir-imagenes',
  imports: [ReactiveFormsModule],
  templateUrl: './subir-imagenes.component.html',
  styleUrl: './subir-imagenes.component.css'
})
export class SubirImagenesComponent implements OnInit {

  form: FormGroup;
  file: File | null = null;
  id_usuario: number = 0;


  constructor(private usuarioService: UsuarioService, private imagenService: ImagenService, private router: Router, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      titulo: this.formBuilder.control('', [Validators.required]),
      descripcion: [''],
      imagen: this.formBuilder.control(null, [Validators.required]),
    })
  }

  ngOnInit() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const datos = JSON.parse(usuario);
      this.id_usuario = datos.id;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      this.form.get('imagen')?.setValue(this.file);
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.file) return;

    const { titulo, descripcion } = this.form.value;

    this.imagenService.SubirImagen(this.file, this.id_usuario, titulo, descripcion).subscribe({
      next: (res) => {
        if (res) {
          this.form.reset();
          this.file = null;
        }
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
      },
    });
  }

}