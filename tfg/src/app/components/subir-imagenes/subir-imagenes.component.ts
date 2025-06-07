import { Component, inject, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

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
  previewUrl: string | ArrayBuffer | null = null;
  uploadProgress: number = 0;
  uploadError: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private imagenService: ImagenService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      imagen: [null, [Validators.required]],
      titulo: ['', [Validators.required]]
    });
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

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.file);
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.file) return;

    this.uploadProgress = 0;
    this.uploadError = null;

    this.imagenService.uploadImage(this.file, this.id_usuario, this.form.value.titulo)
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            console.log('Imagen subida correctamente:', event.body);
            this.router.navigate(['/perfil']);
          }
        },
        error: (err) => {
          console.error('Error al subir imagen:', err);
          this.uploadError = 'Error al subir la imagen. Por favor, inténtalo de nuevo.';
        }
      });
  }

  cancelar() {
    this.router.navigate(['/perfil']);
  }
}