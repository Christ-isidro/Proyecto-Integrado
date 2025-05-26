import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FormUsuariosComponent } from './components/form-usuarios/form-usuarios.component';
import { DetalleUsuarioComponent } from './components/detalle-usuario/detalle-usuario.component';

export const routes: Routes = [
    {
        path: "",
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
    }
];
