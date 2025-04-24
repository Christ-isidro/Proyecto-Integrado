import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  public usuarios: Usuario[] = [];

  constructor(private servicio: UsuarioService, private router: Router) {
    this.servicio.ListarUsuarios().subscribe(
      data => {
        console.log(data);
        this.usuarios = data;
      }
    );
  }

  nuevoUsuario() {
    this.router.navigate(['usuario-nuevo', -1]);
  }
}
