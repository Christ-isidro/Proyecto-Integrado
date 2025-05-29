import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-participante',
  imports: [],
  templateUrl: './participante.component.html',
  styleUrl: './participante.component.css'
})
export class ParticipanteComponent implements OnInit {

  public usuario: Usuario = <Usuario>{};

  constructor(private router: Router) { }


  ngOnInit(): void {
    const usuarioIniciado = localStorage.getItem('usuario');
    if (usuarioIniciado) {
      this.usuario = JSON.parse(usuarioIniciado);
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']); // Cambia a la ruta que corresponda en tu app
  }

  subirImagen(id: number) {
    this.router.navigate(['subir-imagen', this.usuario.id])
  }


}
