import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PessoaComponent } from './pessoa.component';
import { PessoaService } from './pessoa.service';

@NgModule({
  declarations: [
    PessoaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [
    PessoaService
  ],
  exports: [
    PessoaComponent
  ]
})
export class PessoaModule { }