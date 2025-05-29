import { Component } from '@angular/core';
import { Form, FormGroup, ReactiveFormsModule, FormBuilder, Validators, EmailValidator } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  public form: FormGroup;

  constructor(private servicio: UsuarioService, private router: Router, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      nombre: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required]),
      password: this.formBuilder.control('', [Validators.required, Validators.minLength(6)]),
    })
  }

  onSubmit() {
    console.log("Form value: ", this.form.value);
    this.servicio.RegistrarUsuario(this.form.value).subscribe(
      datos => {
        console.log('np: ', datos);
        this.router.navigate(['/']);
      }
    )
  }
}
