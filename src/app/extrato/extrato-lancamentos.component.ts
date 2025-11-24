import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { LancamentosService, Lancamento, IdNome } from '../lancamentos/lancamentos.service';

type Filtros = {
  descricao: string;
  centroCustoId: number | null;
  lancDe: string;  lancAte: string;
  vencDe: string;  vencAte: string;
  baixaDe: string; baixaAte: string;
};

@Component({
  selector: 'app-extrato-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './extrato-lancamentos.component.html',
})
export class ExtratoLancamentosComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(LancamentosService);

  carregando = signal(false);
  erro = signal<string | null>(null);

  // dados base
  centros = signal<IdNome[]>([]);
  todos = signal<Lancamento[]>([]);
  contas = signal<IdNome[]>([]);

form = this.fb.group({
  descricao: [''],
  centroCustoId: [null as number | null],
  contaId: [null as number | null],     // << NOVO
  lancDe: [''],  lancAte: [''],
  vencDe: [''],  vencAte: [''],
  baixaDe: [''], baixaAte: [''],
});

filtros = signal({
  descricao: '', centroCustoId: null as number | null,
  contaId: null as number | null,       // << NOVO
  lancDe: '', lancAte: '', vencDe: '', vencAte: '', baixaDe: '', baixaAte: ''
});

ngOnInit() {
  this.carregando.set(true); this.erro.set(null);

  this.api.listar().subscribe({
    next: (ls) => { this.todos.set(ls ?? []); this.carregando.set(false); },
    error: () => { this.erro.set('Falha ao carregar lançamentos'); this.carregando.set(false); }
  });

  this.api.listarCentrosCusto().subscribe({ next: v => this.centros.set(v ?? []) });
  this.api.listarContas().subscribe({ next: v => this.contas.set(v ?? []) });   // << NOVO

  this.form.valueChanges.subscribe(v => {
    this.filtros.set({
      descricao: (v.descricao ?? '').trim(),
      centroCustoId: (v.centroCustoId as any) ?? null,
      contaId: (v.contaId as any) ?? null,                                      // << NOVO
      lancDe: v.lancDe ?? '', lancAte: v.lancAte ?? '',
      vencDe: v.vencDe ?? '', vencAte: v.vencAte ?? '',
      baixaDe: v.baixaDe ?? '', baixaAte: v.baixaAte ?? '',
    });
  });
}

  private inRange(dateISO?: string | null, de?: string, ate?: string) {
    if (!de && !ate) return true;
    const x = dateISO?.slice(0,10) ?? '';
    if (!x) return false;
    return (!de || x >= de!) && (!ate || x <= ate!); // ISO yyyy-MM-dd compara bem como string
  }

  lista = computed(() => {
  const fs = this.filtros();
  const desc = fs.descricao.toLowerCase();
  const ccId = fs.centroCustoId ?? null;
  const contaId = fs.contaId ?? null;                         // << NOVO

  return this.todos().filter(l => {
    if (desc && !(l.descricao ?? '').toLowerCase().includes(desc)) return false;
    if (ccId && (l.centroCusto?.id ?? null) !== ccId) return false;
    if (contaId && (l.conta?.id ?? null) !== contaId) return false;   // << NOVO

    if (!this.inRange(l.dataLancamentoISO, fs.lancDe, fs.lancAte)) return false;
    if (!this.inRange(l.dataVencimentoISO, fs.vencDe, fs.vencAte)) return false;
    if (!this.inRange(l.dataBaixaISO,      fs.baixaDe, fs.baixaAte)) return false;

    return true;
  });
});

  // totais / saldos (por documento e por baixa)
  totCreditoDoc = computed(() =>
    this.lista().reduce((s,l)=> s + (l.tipoLancamento==='Credito' ? (l.valorDocumento||0) : 0), 0)
  );
  totDebitoDoc = computed(() =>
    this.lista().reduce((s,l)=> s + (l.tipoLancamento==='Debito' ? (l.valorDocumento||0) : 0), 0)
  );
  saldoDoc = computed(() => this.totCreditoDoc() - this.totDebitoDoc());

  totCreditoBaix = computed(() =>
    this.lista().reduce((s,l)=> s + (l.tipoLancamento==='Credito' ? (l.valorBaixado||0) : 0), 0)
  );
  totDebitoBaix = computed(() =>
    this.lista().reduce((s,l)=> s + (l.tipoLancamento==='Debito' ? (l.valorBaixado||0) : 0), 0)
  );
  saldoBaix = computed(() => this.totCreditoBaix() - this.totDebitoBaix());

  limpar() {
    this.form.reset({
      descricao: '', centroCustoId: null,
      lancDe: '', lancAte: '', vencDe: '', vencAte: '', baixaDe: '', baixaAte: ''
    });
  }
}
