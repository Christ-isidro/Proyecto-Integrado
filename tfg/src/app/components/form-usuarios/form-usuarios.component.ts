import { Component } from '@angular/core';
import { Form, FormGroup, ReactiveFormsModule, FormBuilder, Validators, EmailValidator } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { identifierName } from '@angular/compiler';

@Component({
  selector: 'app-form-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './form-usuarios.component.html',
  styleUrl: './form-usuarios.component.css'
})
export class FormUsuariosComponent {
  public usuario: Usuario = <Usuario>{};
  public textoBoton: string;
  public form: FormGroup;

  constructor(private peticion: UsuarioService, private router: Router, private ar: ActivatedRoute, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      id: this.formBuilder.control("-1"),
      nombre: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required]),
      password: this.formBuilder.control('', [Validators.required]),
      rol: this.formBuilder.control('participante')
    });
    this.textoBoton = 'Agregar';
  }

  onSubmit() {
    //Recibe cuando el formulario es submiteado. Llama a la función insertar del servicio PAjax y le paso this.persona
    console.log('this.form.value ', this.form.value);
    if (this.form.value.id == -1) {
      this.peticion.InserterUsuario(this.form.value).subscribe(
        datos => {

          console.log('np: ', datos);
          this.router.navigate(['/']);
        });
      // } else {
      //   this.peticion.editar(this.form.value).subscribe(
      //     datos => {
      //       console.log('Datos: ', datos);
      //       this.router.navigate(['/']);
      //     });
      // }
    }
  }
}
