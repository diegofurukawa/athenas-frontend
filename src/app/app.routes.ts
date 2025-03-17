import { Routes } from '@angular/router';
import { PessoaComponent } from './pessoa/pessoa.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/pessoas', pathMatch: 'full' },
  { path: 'pessoas', component: PessoaComponent }
];