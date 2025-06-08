import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public form: FormGroup;
  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private servicio: UsuarioService, 
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.form.valid) {
      this.isLoading = true;
      const { email, password } = this.form.value;
      
      console.log('Intentando iniciar sesión con:', { email });

      this.servicio.login(email, password).subscribe({
        next: (res) => {
          console.log('Respuesta del servidor:', res);
          if (res.success) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('usuario', JSON.stringify(res.usuario));

            const rol = res.usuario.rol;
            if (rol === 'administrador') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/inicio']);
            }
          } else {
            this.errorMessage = res.message || 'Error al iniciar sesión';
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Error al conectar con el servidor';
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      if (this.form.get('email')?.errors?.['required']) {
        this.errorMessage = 'El email es obligatorio';
      } else if (this.form.get('email')?.errors?.['email']) {
        this.errorMessage = 'El email no es válido';
      } else if (this.form.get('password')?.errors?.['required']) {
        this.errorMessage = 'La contraseña es obligatoria';
      }
    }
  }

  volver() {
    this.router.navigate(['/']);
  }
}
