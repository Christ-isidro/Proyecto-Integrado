import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FormUsuariosComponent } from './components/form-usuarios/form-usuarios.component';
import { DetalleUsuarioComponent } from './components/detalle-usuario/detalle-usuario.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { AdministradorComponent } from './components/administrador/administrador.component';
import { ParticipanteComponent } from './components/participante/participante.component';
import { SubirImagenesComponent } from './components/subir-imagenes/subir-imagenes.component';
import { FormPerfilComponent } from './components/form-perfil/form-perfil.component';
import { ListaImagenesComponent } from './components/lista-imagenes/lista-imagenes.component';
import { ValidarImagenesComponent } from './components/validar-imagenes/validar-imagenes.component';
import { InicioComponent } from './components/inicio/inicio.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent
    },
    {
        path: "usuarios",
        component: UsuariosComponent
    },
    {
        path: "subir-imagen/:id",
        component: SubirImagenesComponent
    },
    {
        path: "usuario-nuevo/:id",
        component: FormUsuariosComponent
    },
    {
        path: "usuario-editar/:id",
        component: FormUsuariosComponent
    },
    {
        path: "usuarios/usuario/:id",
        component: DetalleUsuarioComponent
    },
    {
        path: "registrar",
        component: RegistroComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "admin",
        component: AdministradorComponent
    },
    {
        path: "perfil",
        component: ParticipanteComponent
    },
    {
        path: "editar-perfil/:id",
        component: FormPerfilComponent
    },
    {
        path: "imagenes",
        component: ListaImagenesComponent
    },
    {
        path: "validar/:id_imagen",
        component: ValidarImagenesComponent
    },
    {
        path: "inicio",
        component: InicioComponent
    }
];
