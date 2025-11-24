import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { LancamentosService, Lancamento, LancamentoPayload, IdNome } from './lancamentos.service';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lancamentos.component.html',
  styles: [':host{display:block;}']
})
export class LancamentosComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(LancamentosService);

  lancamentos = signal<Lancamento[]>([]);
  filtro = signal('');
  carregando = signal(false);
  erro = signal<string | null>(null);

  contas = signal<IdNome[]>([]);
  pessoas = signal<IdNome[]>([]);
  centros = signal<IdNome[]>([]);

tipos = ['Debito', 'Credito'] as const;
situacoes = ['Aberto', 'Baixado'] as const;

  form = this.fb.group({
    descricao: ['', Validators.required],
    parcela: ['1/1', Validators.required],
    dataLancamentoISO: [this.hojeISO(), Validators.required],
    dataVencimentoISO: [this.hojeISO()],
    dataBaixaISO: [null as string | null],
    valorDocumento: [0 as number, [Validators.required]],
    valorBaixado: [0 as number, [Validators.required]],
    tipoLancamento: [this.tipos[0], Validators.required],
    situacao: [this.situacoes[0], Validators.required],
    contaId: [null as number | null],
    pessoaId: [null as number | null],
    centroCustoId: [null as number | null],
  });

  hojeISO(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  listaFiltrada = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    const arr = this.lancamentos();
    if (!f) return arr;
    return arr.filter(l =>
      (l.descricao ?? '').toLowerCase().includes(f) ||
      (l.tipoLancamento ?? '').toLowerCase().includes(f) ||
      (l.situacao ?? '').toLowerCase().includes(f) ||
      String(l.valorDocumento ?? '').toLowerCase().includes(f) ||
      (l.conta?.descricao ?? '').toLowerCase().includes(f) ||
      (l.centroCusto?.descricao ?? '').toLowerCase().includes(f) ||
      (l.pessoa?.nome ?? l.pessoa?.razaoSocial ?? '').toLowerCase().includes(f)
    );
  });

  ngOnInit() { this.carregarTudo(); }

  carregarTudo() {
    this.carregando.set(true);
    this.erro.set(null);

    this.api.listar().subscribe({
      next: (ls) => { this.lancamentos.set(ls ?? []); this.carregando.set(false); },
      error: () => { this.erro.set('Falha ao carregar lançamentos'); this.carregando.set(false); }
    });

    this.api.listarContas().subscribe({ next: (v) => this.contas.set(v ?? []) });
    this.api.listarPessoas().subscribe({ next: (v) => this.pessoas.set(v ?? []) });
    this.api.listarCentrosCusto().subscribe({ next: (v) => this.centros.set(v ?? []) });
  }

  criar() {
    if (this.form.invalid) return;
    const payload: LancamentoPayload = this.form.getRawValue();
    this.carregando.set(true); this.erro.set(null);

    this.api.criar(payload).subscribe({
      next: () => {
        this.form.reset({
          descricao: '',
          parcela: '1/1',
          dataLancamentoISO: this.hojeISO(),
          dataVencimentoISO: this.hojeISO(),
          dataBaixaISO: null,
          valorDocumento: 0,
          valorBaixado: 0,
          tipoLancamento: this.tipos[0],
          situacao: this.situacoes[0],
          contaId: null,
          pessoaId: null,
          centroCustoId: null
        });
        this.carregarTudo();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Falha ao criar lançamento';
        this.erro.set(msg);
        this.carregando.set(false);
      }
    });
  }

  atualizar(id: number, dto: Partial<LancamentoPayload>) {
    this.carregando.set(true); this.erro.set(null);
    this.api.atualizar(id, dto).subscribe({
      next: () => this.carregarTudo(),
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Falha ao atualizar';
        this.erro.set(msg);
        this.carregando.set(false);
      }
    });
  }

remover(id: number) {
  this.carregando.set(true);
  this.erro.set(null);

  this.api.remover(id).subscribe({
    next: () => this.carregarTudo(),
    error: (err) => {
      const msg =
        err?.error?.message ||
        err?.error?.error ||
        err?.message ||
        'Falha ao excluir';
      this.erro.set(msg);
      this.carregando.set(false);
    },
  });
}

toNumber(n: any): number {
  const v = Number(n);
  return Number.isNaN(v) ? 0 : v;
}
}