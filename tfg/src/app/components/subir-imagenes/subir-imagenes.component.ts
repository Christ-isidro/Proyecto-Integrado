import { Component, inject, OnInit } from '@angular/core';
import { ImagenService } from '../../services/imagen.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';

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
    private ar: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      imagen: [null, [Validators.required]],
      titulo: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Obtener el ID del usuario de los parámetros de la ruta
    const id = this.ar.snapshot.params['id'];
    if (id) {
      this.id_usuario = parseInt(id);
    } else {
      // Si no hay ID en la ruta, intentar obtenerlo del localStorage
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        this.id_usuario = usuario.id;
      }
    }

    if (!this.id_usuario) {
      console.error('No se pudo obtener el ID del usuario');
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      
      // Validar el tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(this.file.type)) {
        this.uploadError = 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF y WEBP.';
        this.file = null;
        input.value = '';
        return;
      }

      // Validar el tamaño del archivo (máximo 20MB)
      const maxSize = 20 * 1024 * 1024; // 20MB en bytes
      if (this.file.size > maxSize) {
        this.uploadError = `El archivo es demasiado grande (${(this.file.size / 1024 / 1024).toFixed(2)}MB). El tamaño máximo permitido es 20MB.`;
        this.file = null;
        input.value = '';
        return;
      }

      this.uploadError = null;
      this.form.get('imagen')?.setValue(this.file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.file);
    }
  }

  onSubmit() {
    if (this.form.valid && this.file && this.id_usuario) {
      this.uploadError = null;
      this.uploadProgress = 0;

      console.log('Iniciando subida de imagen:', {
        fileName: this.file.name,
        fileSize: this.file.size,
        fileType: this.file.type,
        id_usuario: this.id_usuario,
        titulo: this.form.get('titulo')?.value
      });

      this.imagenService.uploadImage(
        this.file,
        this.id_usuario,
        this.form.get('titulo')?.value
      ).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / (event.total || event.loaded));
          } else if (event instanceof HttpResponse || !event.type) {
            console.log('Respuesta del servidor:', event);
            // Si la respuesta es exitosa o contiene datos, navegar al perfil
            if (event.body?.success || event.success) {
              console.log('Imagen subida exitosamente');
              this.router.navigate(['/perfil']);
            } else {
              this.uploadError = (event.body?.error || event.error || 'Error desconocido al subir la imagen');
              console.error('Error en la respuesta:', this.uploadError);
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al subir imagen:', error);
          if (error.error?.error) {
            this.uploadError = error.error.error;
          } else if (error.message) {
            this.uploadError = error.message;
          } else {
            this.uploadError = 'Error desconocido al subir la imagen';
          }
        },
        complete: () => {
          console.log('Subida completada');
          if (!this.uploadError) {
            this.router.navigate(['/perfil']);
          }
        }
      });
    } else {
      this.uploadError = 'Por favor, completa todos los campos requeridos.';
    }
  }

  cancelar() {
    this.router.navigate(['/perfil']);
  }
}