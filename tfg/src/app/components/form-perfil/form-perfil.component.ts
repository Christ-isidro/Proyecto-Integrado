import { Component } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-perfil',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './form-perfil.component.html',
  styleUrl: './form-perfil.component.css'
})
export class FormPerfilComponent {
  public usuario: Usuario = <Usuario>{};
  public form: FormGroup;

  constructor(private peticion: UsuarioService, private router: Router, private ar: ActivatedRoute, private formBuilder: FormBuilder) {
    const idUsuario = this.ar.snapshot.params['id'];
    this.form = this.formBuilder.group({
      id: this.formBuilder.control(idUsuario),
      nombre: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required]),
      password: this.formBuilder.control('', [Validators.required, Validators.minLength(6)]),
      rol: this.formBuilder.control('', [Validators.required]),
    });
  }

  onSubmit() {
    //Recibe cuando el formulario es submiteado. Llama a la función insertar del servicio PAjax y le paso this.persona
    this.peticion.EditarUsuario(this.form.value).subscribe(
      datos => {
        console.log('Datos: ', datos);
        this.router.navigate(['/perfil']);
      });
  }

  ngOnInit() {
    const idUsuario = this.ar.snapshot.params['id'];
    console.log('id: ', idUsuario);

    this.peticion.ObtenerIdUsuario(idUsuario).subscribe({
      next: res => {
        this.usuario = res;
        console.log(res);
        this.form.setValue({
          id: this.usuario.id,          // Asignar el id
          nombre: this.usuario.nombre,  // Asignar el nombre
          email: this.usuario.email,    // Asignar el email
          password: '',                 // Dejar el campo de la contraseña vacío (si lo estás editando)
          rol: this.usuario.rol         // Asignar el rol
        });
        console.log(res);
      },
      error: error => {
        console.error('error!', error);
      }
    });
  }
}

