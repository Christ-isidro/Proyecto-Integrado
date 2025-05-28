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

  constructor(private fb: FormBuilder, private servicio: UsuarioService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.servicio.login(email, password).subscribe(res => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));

          const rol = res.usuario.rol;
          if (rol === 'administrador') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/participante']);
          }
        } else {
          alert('Credenciales incorrectas');
        }
      });
    }
  }

  volver(){
    this.router.navigate(['/']);
  }
}
