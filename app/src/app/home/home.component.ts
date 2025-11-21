import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LancamentosService, Lancamento, IdNome } from '../lancamentos/lancamentos.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private api: LancamentosService) {}

  @ViewChild('gastosCentroChart') gastosCentroChart!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  lancs: Lancamento[] = [];
  contas: IdNome[] = [];

  contaId: number | null = null;
  de = '';  // yyyy-MM-dd
  ate = '';
  usarBaixa = false;

  erro: string | null = null;
  msgSemDados = '';

  ngOnInit() {
    this.api.listar().subscribe({
      next: (ls) => { this.lancs = ls ?? []; this.drawIfReady(); },
      error: () => { this.erro = 'Falha ao carregar lançamentos'; }
    });
    this.api.listarContas().subscribe({
      next: (v) => { 
        this.contas = v ?? []; 
        if (!this.contaId && this.contas.length) this.contaId = this.contas[0].id;
        this.drawIfReady();
      }
    });
  }

  ngAfterViewInit() { this.drawIfReady(); }

  aplicar() { this.redesenhar(); }
  limpar() { this.de = ''; this.ate = ''; this.usarBaixa = false; this.redesenhar(); }

  private drawIfReady() {
    if (!this.gastosCentroChart) return;
    if (!this.lancs.length || !this.contas.length) return;
    requestAnimationFrame(() => this.redesenhar());
  }

  private refDateISO(l: Lancamento): string | null {
    const iso = this.usarBaixa ? l.dataBaixaISO : l.dataLancamentoISO;
    return iso ? iso.slice(0, 10) : null;
  }

  private inRangeISO(dateISO: string | null): boolean {
    if (!dateISO) return false;
    if (this.de && dateISO < this.de) return false;
    if (this.ate && dateISO > this.ate) return false;
    return true;
  }

  private valorDebito(l: Lancamento): number {
    const tipo = String(l.tipoLancamento ?? '').toLowerCase();
    if (tipo !== 'debito' && !tipo.startsWith('debit')) return 0;
    const v = this.usarBaixa ? (l.valorBaixado ?? 0) : (l.valorDocumento ?? 0);
    return Number(v) || 0;
  }

  private groupByCentroForConta(): Map<string, number> {
    const map = new Map<string, number>();
    const cid = this.contaId;

    for (const l of this.lancs) {
      if (cid && (l.conta?.id ?? null) !== cid) continue;

      const refDate = this.refDateISO(l);
      if (!this.inRangeISO(refDate)) continue;

      const v = this.valorDebito(l);
      if (!v) continue;

      const label = l.centroCusto?.descricao
        || (l.centroCusto?.id != null ? `#${l.centroCusto.id}` : '— Sem centro —');

      map.set(label, (map.get(label) ?? 0) + v);
    }
    return map;
  }

  private redesenhar() {
    if (!this.gastosCentroChart) return;

    this.chart?.destroy();
    this.msgSemDados = '';

    const dataMap = this.groupByCentroForConta();
    const labels = [...dataMap.keys()];
    const data = [...dataMap.values()];

    if (!labels.length) {
      this.msgSemDados = 'Sem dados no período/conta selecionados.';
      return;
    }

    const total = data.reduce((s, n) => s + Math.abs(n || 0), 0);
    if (total <= 0) {
      this.msgSemDados = 'Sem valores > 0 no período/conta selecionados.';
      return;
    }

    this.chart = new Chart(this.gastosCentroChart.nativeElement.getContext('2d')!, {
      type: 'doughnut',
      data: { labels, datasets: [{ data }] },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${Number(ctx.parsed)
                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          }
        }
      }
    });
  }

  ngOnDestroy() { this.chart?.destroy(); }
}
