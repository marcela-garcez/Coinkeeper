import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ContasService, Conta, IdNome, ContaPayload } from './contas.service';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contas.component.html',
  styles: [':host{display:block;}']
})
export class ContasComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(ContasService);

  // tabela
  contas = signal<Conta[]>([]);
  filtro = signal('');
  carregando = signal(false);
  erro = signal<string | null>(null);

  bancos = signal<IdNome[]>([]);
  usuarios = signal<IdNome[]>([]);
  metas = signal<IdNome[]>([]);

  tiposConta = [
  { value: 'CONTA_CORRENTE',     label: 'Conta Corrente' },
  { value: 'CONTA_INVESTIMENTO', label: 'Conta Investimento' },
  { value: 'CARTAO_CREDITO',     label: 'Cartão de Crédito' },
  { value: 'CARTAO_ALIMENTACAO', label: 'Cartão Alimentação' },
  { value: 'POUPANCA',           label: 'Poupança' },
] as const;

form = this.fb.group({
  descricao: ['', Validators.required],
  saldo: [0 as number, Validators.required],
  limite: [0 as number, Validators.required],
  tipoConta: [this.tiposConta[0].value, Validators.required],  // << aqui
  usuarioId: [null as number | null],
  bancoId: [null as number | null],
  metaFinanceiraId: [null as number | null],
});

  contasFiltradas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    const arr = this.contas();
    if (!f) return arr;
    return arr.filter(c =>
      (c.descricao ?? '').toLowerCase().includes(f) ||
      String(c.saldo ?? '').toLowerCase().includes(f) ||
      String(c.limite ?? '').toLowerCase().includes(f) ||
      (c.tipoConta ?? '').toLowerCase().includes(f)
    );
  });

  ngOnInit() {
    this.carregarTudo();
  }

  carregarTudo() {
    this.carregando.set(true);
    this.erro.set(null);
    // carrega tabela
    this.api.listar().subscribe({
      next: (cs) => { this.contas.set(cs ?? []); this.carregando.set(false); },
      error: () => { this.erro.set('Falha ao carregar contas'); this.carregando.set(false); },
    });
    // carrega combos (em paralelo)
    this.api.listarBancos().subscribe({ next: (b) => this.bancos.set(b ?? []) });
    this.api.listarUsuarios().subscribe({ next: (u) => this.usuarios.set(u ?? []) });
    this.api.listarMetas().subscribe({ next: (m) => this.metas.set(m ?? []) });
  }

  criar() {
  if (this.form.invalid) return;

  const payload: ContaPayload = this.form.getRawValue();
  console.log('FORM payload =>', payload);

  this.carregando.set(true);
  this.erro.set(null);

  this.api.criar(payload).subscribe({
    next: () => {
      this.form.reset({
        descricao: '', saldo: 0, limite: 0, tipoConta: this.tiposConta[0].value,
        usuarioId: null, bancoId: null, metaFinanceiraId: null
      });
      this.carregarTudo();
    },
    error: (err) => {
      console.error('BACK error =>', err);
      const msg = err?.error?.message || err?.error?.error || err?.message || 'Falha ao criar conta';
      this.erro.set(msg);
      this.carregando.set(false);
    }
  });
}


  atualizar(id: number, dto: Partial<ContaPayload>) {
    this.carregando.set(true);
    this.erro.set(null);
    this.api.atualizar(id, dto).subscribe({
      next: () => this.carregarTudo(),
      error: () => { this.erro.set('Falha ao atualizar conta'); this.carregando.set(false); }
    });
  }

  remover(id: number) {
    this.carregando.set(true);
    this.erro.set(null);
    this.api.remover(id).subscribe({
      next: () => this.carregarTudo(),
      error: () => { this.erro.set('Falha ao excluir conta'); this.carregando.set(false); }
    });
  }

  toNumber(n: any): number {
    const v = Number(n);
    return isNaN(v) ? 0 : v;
  }
}
