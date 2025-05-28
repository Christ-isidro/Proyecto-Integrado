import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FormUsuariosComponent } from './components/form-usuarios/form-usuarios.component';
import { DetalleUsuarioComponent } from './components/detalle-usuario/detalle-usuario.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';

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
        path: "usuario-nuevo/:id",
        component: FormUsuariosComponent
    },
    {
        path: "usuario-editar/:id",
        component: FormUsuariosComponent
    },
    {
        path: "usuario/:id",
        component: DetalleUsuarioComponent
    },
    {
        path: "registrar",
        component: RegistroComponent
    },
    {
        path: "login",
        component: LoginComponent
    }
];
