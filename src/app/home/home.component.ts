import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {
  LancamentosService,
  Lancamento,
} from '../lancamentos/lancamentos.service';
import { DateTime } from 'luxon';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gastosCentroChart')
  gastosCentroChart!: ElementRef<HTMLCanvasElement>;

  @ViewChild('extratoChart')
  extratoChart!: ElementRef<HTMLCanvasElement>;

  private gastosChartInstance?: Chart;
  private extratoChartInstance?: Chart;

  lancamentos: Lancamento[] = [];

  // ⭐ Indicadores principais
  totalLancamentos = 0;
  totalEntradas = 0;
  totalSaidas = 0;
  saldoAtual = 0;

  // ⭐ Indicadores avançados
  ultimoLancamento?: Lancamento;
  entradasMesAtual = 0;
  saidasMesAtual = 0;
  totalMesAtual = 0;
  variacaoPercentual = 0;

  constructor(private lancamentosService: LancamentosService) {}

  ngAfterViewInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.gastosChartInstance?.destroy();
    this.extratoChartInstance?.destroy();
  }

  // =====================================================
  //        CARREGAR DADOS DO BACKEND
  // =====================================================
  private carregarDados(): void {
    this.lancamentosService.listar().subscribe({
      next: (dados) => {
        this.lancamentos = dados;
        this.atualizarIndicadores();
        this.criarGraficoGastos();
        this.criarGraficoExtrato();
      },
      error: (e) => console.error('Erro ao carregar lançamentos', e),
    });
  }

  // =====================================================
  //               INDICADORES DO TOPO
  // =====================================================
  private atualizarIndicadores(): void {
    const hoje = DateTime.now();
    const mesAtual = hoje.month;
    const anoAtual = hoje.year;

    this.totalLancamentos = this.lancamentos.length;

    this.totalEntradas = this.lancamentos
      .filter((l) => l.tipoLancamento === 'Credito')
      .reduce((s, l) => s + l.valorDocumento, 0);

    this.totalSaidas = this.lancamentos
      .filter((l) => l.tipoLancamento === 'Debito')
      .reduce((s, l) => s + l.valorDocumento, 0);

    this.saldoAtual = this.totalEntradas - this.totalSaidas;

    // Último lançamento
    this.ultimoLancamento = this.lancamentos
      .slice()
      .sort(
        (a, b) =>
          DateTime.fromISO(b.dataLancamentoISO!).toMillis() -
          DateTime.fromISO(a.dataLancamentoISO!).toMillis()
      )[0];

    // Entradas mês atual
    this.entradasMesAtual = this.lancamentos
      .filter(
        (l) =>
          l.tipoLancamento === 'Credito' &&
          DateTime.fromISO(l.dataLancamentoISO!).month === mesAtual &&
          DateTime.fromISO(l.dataLancamentoISO!).year === anoAtual
      )
      .reduce((s, l) => s + l.valorDocumento, 0);

    // Saídas mês atual
    this.saidasMesAtual = this.lancamentos
      .filter(
        (l) =>
          l.tipoLancamento === 'Debito' &&
          DateTime.fromISO(l.dataLancamentoISO!).month === mesAtual &&
          DateTime.fromISO(l.dataLancamentoISO!).year === anoAtual
      )
      .reduce((s, l) => s + l.valorDocumento, 0);

    this.totalMesAtual = this.entradasMesAtual - this.saidasMesAtual;

    // MES ANTERIOR
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

    const entradasMesAnterior = this.lancamentos
      .filter(
        (l) =>
          l.tipoLancamento === 'Credito' &&
          DateTime.fromISO(l.dataLancamentoISO!).month === mesAnterior &&
          DateTime.fromISO(l.dataLancamentoISO!).year === anoAnterior
      )
      .reduce((s, l) => s + l.valorDocumento, 0);

    const saidasMesAnterior = this.lancamentos
      .filter(
        (l) =>
          l.tipoLancamento === 'Debito' &&
          DateTime.fromISO(l.dataLancamentoISO!).month === mesAnterior &&
          DateTime.fromISO(l.dataLancamentoISO!).year === anoAnterior
      )
      .reduce((s, l) => s + l.valorDocumento, 0);

    const totalMesAnterior = entradasMesAnterior - saidasMesAnterior;

    this.variacaoPercentual =
      totalMesAnterior === 0
        ? 0
        : ((this.totalMesAtual - totalMesAnterior) / totalMesAnterior) * 100;
  }

  // =====================================================
  //         GRÁFICO DE LANÇAMENTOS POR MÊS
  // =====================================================
  private criarGraficoGastos(): void {
    const ctx = this.gastosCentroChart?.nativeElement;
    if (!ctx) return;

    this.gastosChartInstance?.destroy();

    const meses = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    const dadosMes = new Array(12).fill(0);

    for (const l of this.lancamentos) {
      if (l.dataLancamentoISO) {
        const mes = DateTime.fromISO(l.dataLancamentoISO).month - 1;
        dadosMes[mes]++;
      }
    }

    this.gastosChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Lançamentos',
            data: dadosMes,
            backgroundColor: 'rgba(156, 109, 255, 0.6)',
            borderColor: '#a26dff',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#c8b8ff' } },
          y: { ticks: { color: '#c8b8ff' } },
        },
      },
    });
  }

  // =====================================================
  //         GRÁFICO EXTRATO (ENTRADAS X SAÍDAS)
  // =====================================================
  private criarGraficoExtrato(): void {
    const ctx = this.extratoChart?.nativeElement;
    if (!ctx) return;

    this.extratoChartInstance?.destroy();

    this.extratoChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Entradas', 'Saídas'],
        datasets: [
          {
            data: [this.totalEntradas, this.totalSaidas],
            backgroundColor: [
              'rgba(115, 173, 255, 0.7)',
              'rgba(181, 130, 255, 0.7)',
            ],
            borderColor: ['#73adff', '#b582ff'],
            borderWidth: 2,
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#c8b8ff' },
          },
        },
      },
    });
  }
}
