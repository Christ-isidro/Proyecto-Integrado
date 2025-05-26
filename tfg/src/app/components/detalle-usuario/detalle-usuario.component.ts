import { Component } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalle-usuario',
  imports: [],
  templateUrl: './detalle-usuario.component.html',
  styleUrl: './detalle-usuario.component.css'
})
export class DetalleUsuarioComponent {
  public usuario: Usuario = <Usuario>{};

  constructor(private servicioUsuario: UsuarioService, private router: Router, private ar: ActivatedRoute) {
    let id_usuario = parseInt(this.ar.snapshot.params["id"]);

    if (id_usuario) {
      this.servicioUsuario.ObtenerIdUsuario(id_usuario).subscribe({
        next: (data) => {
          this.usuario = data;
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  volver() {
    this.router.navigate(['/']);
  }

}
