import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FormUsuariosComponent } from './components/form-usuarios/form-usuarios.component';

export const routes: Routes = [
    {
        path: "",
        component: UsuariosComponent
    },
    {
        path: "usuario-nuevo/:id",
        component: FormUsuariosComponent
    }
];
