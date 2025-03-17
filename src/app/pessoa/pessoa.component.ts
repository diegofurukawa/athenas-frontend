import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PessoaService } from './pessoa.service';
import { Pessoa } from './pessoa.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-pessoa',
  templateUrl: './pessoa.component.html',
  styleUrls: ['./pessoa.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [PessoaService]
})
export class PessoaComponent implements OnInit {
  pessoas: Pessoa[] = [];
  pessoaSelecionada: Pessoa | null = null;
  pessoaForm: FormGroup;
  modoEdicao: boolean = false;
  loading: boolean = false;
  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  termoPesquisa: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private pessoaService: PessoaService
  ) {
    this.pessoaForm = this.formBuilder.group({
      nome: ['', [Validators.required]],
      data_nasc: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)]],
      sexo: ['', [Validators.required]],
      altura: ['', [Validators.required, Validators.min(0.1), Validators.max(3)]],
      peso: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.carregarPessoas();
  }

  carregarPessoas(): void {
    this.loading = true;
    this.pessoaService.getPessoas().subscribe({
      next: (data) => {
        this.pessoas = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas', error);
        this.mostrarMensagem('Erro ao carregar a lista de pessoas.', 'erro');
        this.loading = false;
      }
    });
  }

  mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro' | ''): void {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    // Configura um timer para limpar a mensagem após 5 segundos
    if (texto) {
      setTimeout(() => {
        this.mensagem = '';
        this.tipoMensagem = '';
      }, 5000);
    }
  }

  pesquisar(): void {
    if (this.termoPesquisa.match(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)) {
      // Se o termo é um CPF, pesquisa por CPF
      this.loading = true;
      this.pessoaService.getPessoaByCpf(this.termoPesquisa).subscribe({
        next: (data) => {
          this.pessoaSelecionada = data;
          this.preencherFormulario(data);
          this.modoEdicao = true;
          this.mostrarMensagem('Pessoa encontrada com sucesso!', 'sucesso');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao pesquisar pessoa', error);
          this.mostrarMensagem('Pessoa não encontrada com este CPF.', 'erro');
          this.pessoaSelecionada = null;
          this.loading = false;
        }
      });
    } else if (this.termoPesquisa.trim() === '') {
      // Se estiver vazio, carrega todos
      this.carregarPessoas();
    } else {
      // Poderia implementar pesquisa por nome ou outros critérios
      this.mostrarMensagem('Por favor, digite um CPF válido no formato 000.000.000-00.', 'erro');
    }
  }

  preencherFormulario(pessoa: Pessoa): void {
    this.pessoaForm.patchValue({
      nome: pessoa.nome,
      data_nasc: pessoa.data_nasc,
      cpf: pessoa.cpf,
      sexo: pessoa.sexo,
      altura: pessoa.altura,
      peso: pessoa.peso
    });
  }

  incluir(): void {
    if (this.pessoaForm.valid) {
      const novaPessoa: Pessoa = this.pessoaForm.value;
      this.loading = true;
      
      this.pessoaService.createPessoa(novaPessoa).subscribe({
        next: (data) => {
          console.log('Pessoa criada com sucesso!', data);
          this.mostrarMensagem('Pessoa incluída com sucesso!', 'sucesso');
          this.carregarPessoas();
          this.limparFormulario();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar pessoa', error);
          this.mostrarMensagem('Erro ao incluir pessoa. Verifique os dados e tente novamente.', 'erro');
          this.loading = false;
        }
      });
    } else {
      this.mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'erro');
      this.marcarCamposInvalidos();
    }
  }

  alterar(): void {
    if (this.pessoaForm.valid && this.pessoaSelecionada) {
      const pessoaAtualizada: Pessoa = {
        ...this.pessoaForm.value,
        id: this.pessoaSelecionada.id
      };
      
      this.loading = true;
      this.pessoaService.updatePessoa(this.pessoaSelecionada.id!, pessoaAtualizada).subscribe({
        next: (data) => {
          console.log('Pessoa atualizada com sucesso!', data);
          this.mostrarMensagem('Pessoa atualizada com sucesso!', 'sucesso');
          this.carregarPessoas();
          this.limparFormulario();
          this.pessoaSelecionada = null;
          this.modoEdicao = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar pessoa', error);
          this.mostrarMensagem('Erro ao alterar pessoa. Verifique os dados e tente novamente.', 'erro');
          this.loading = false;
        }
      });
    } else {
      this.mostrarMensagem('Por favor, preencha todos os campos corretamente ou selecione uma pessoa para alterar.', 'erro');
      this.marcarCamposInvalidos();
    }
  }

  excluir(): void {
    if (this.pessoaSelecionada) {
      if (confirm(`Tem certeza que deseja excluir ${this.pessoaSelecionada.nome}?`)) {
        this.loading = true;
        this.pessoaService.deletePessoa(this.pessoaSelecionada.id!).subscribe({
          next: () => {
            console.log('Pessoa excluída com sucesso!');
            this.mostrarMensagem('Pessoa excluída com sucesso!', 'sucesso');
            this.carregarPessoas();
            this.limparFormulario();
            this.pessoaSelecionada = null;
            this.modoEdicao = false;
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro ao excluir pessoa', error);
            this.mostrarMensagem('Erro ao excluir pessoa.', 'erro');
            this.loading = false;
          }
        });
      }
    } else {
      this.mostrarMensagem('Por favor, selecione uma pessoa para excluir.', 'erro');
    }
  }

  limparFormulario(): void {
    this.pessoaForm.reset();
    this.pessoaSelecionada = null;
    this.modoEdicao = false;
    this.termoPesquisa = '';
    this.mensagem = '';
    this.tipoMensagem = '';
  }

  selecionarPessoa(pessoa: Pessoa): void {
    this.pessoaSelecionada = pessoa;
    this.preencherFormulario(pessoa);
    this.modoEdicao = true;
    this.mensagem = '';
    this.tipoMensagem = '';
  }

  marcarCamposInvalidos(): void {
    Object.keys(this.pessoaForm.controls).forEach(key => {
      const control = this.pessoaForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  calcularPesoIdeal(): void {
    if (this.pessoaSelecionada) {
      this.loading = true;
      this.pessoaService.calcularPesoIdeal(this.pessoaSelecionada.id!).subscribe({
        next: (data) => {
          if (data.peso_ideal !== undefined) {
            this.mostrarMensagem(`Peso ideal calculado: ${data.peso_ideal} kg`, 'sucesso');
          } else {
            this.mostrarMensagem('Não foi possível calcular o peso ideal.', 'erro');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao calcular peso ideal', error);
          this.mostrarMensagem('Erro ao calcular peso ideal.', 'erro');
          this.loading = false;
        }
      });
    } else {
      this.mostrarMensagem('Por favor, selecione uma pessoa para calcular o peso ideal.', 'erro');
    }
  }
}