import { Component, inject, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subir-imagenes',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
  isUploading: boolean = false;
  uploadSuccess: boolean = false;

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
    } else {
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      this.form.get('imagen')?.setValue(this.file);

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(this.file.type)) {
        this.uploadError = 'Solo se permiten archivos JPG, PNG y GIF.';
        this.file = null;
        this.form.get('imagen')?.setValue(null);
        this.previewUrl = null;
        return;
      }

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.file);
      this.uploadError = null;
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.file) {
      this.uploadError = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.uploadSuccess = false;

    this.imagenService.uploadImage(this.file, this.id_usuario, this.form.value.titulo)
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            const response = event.body;
            if (response.success) {
              this.uploadSuccess = true;
              setTimeout(() => {
                this.router.navigate(['/perfil']);
              }, 1500);
            } else {
              this.uploadError = response.message || 'Error al subir la imagen.';
            }
            this.isUploading = false;
          }
        },
        error: (err) => {
          console.error('Error al subir imagen:', err);
          this.uploadError = err.error?.message || 'Error al subir la imagen. Por favor, inténtalo de nuevo.';
          this.isUploading = false;
        },
        complete: () => {
          this.isUploading = false;
        }
      });
  }

  cancelar() {
    this.router.navigate(['/perfil']);
  }
}