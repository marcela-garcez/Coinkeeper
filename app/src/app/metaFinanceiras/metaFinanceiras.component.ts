import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaFinanceirasService, MetaFinanceira } from './metaFinanceiras.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-metaFinanceiras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h3 mb-0">Metas Financeiras</h1>

      <button class="btn btn-outline-secondary btn-sm"
              (click)="carregar()" [disabled]="carregando()">
        <span *ngIf="carregando()" class="spinner-border spinner-border-sm me-2"></span>
        Recarregar
      </button>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <!-- Formulário de criação -->
        <form (ngSubmit)="criar(desc.value, val.value, dt.value)" class="row g-2 align-items-center">
          <div class="col-12 col-md-5">
            <input #desc class="form-control" placeholder="Descrição da meta" />
          </div>
          <div class="col-6 col-md-3">
            <input #val type="number" step="0.01" class="form-control" placeholder="Valor" />
          </div>
          <div class="col-6 col-md-3">
            <input #dt type="date" class="form-control" placeholder="Data Alvo" />
          </div>
          <div class="col-12 col-md-1 d-grid">
            <button type="submit" class="btn btn-primary" [disabled]="carregando()">Criar</button>
          </div>
        </form>

        <div *ngIf="erro()" class="alert alert-danger mt-3 py-2 mb-0">
          {{ erro() }}
        </div>
      </div>
    </div>

    <div class="card shadow-sm mt-4">
      <div class="card-body p-0">
        <div class="p-3 pt-3">
          <input
            class="form-control"
            placeholder="Filtrar por descrição / valor / data..."
            (input)="filtro.set(($any($event.target).value ?? '').toString())"
          />
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width:80px;">ID</th>
                <th>Descrição</th>
                <th style="width:160px;">Valor</th>
                <th style="width:190px;">Data Alvo</th>
                <th class="text-end" style="width:220px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of metasFiltradas()">
                <td class="text-muted">#{{ m.id }}</td>

                <td>
                  <input [value]="m.descricaoMeta" #d class="form-control form-control-sm" />
                </td>

                <td>
                  <input type="number" step="0.01"
                         [value]="m.valorMeta"
                         #v
                         class="form-control form-control-sm" />
                </td>

                <td>
                  <input type="date"
                         [value]="toInputDate(m.dataAlvo)"
                         #da
                         class="form-control form-control-sm" />
                </td>

                <td class="text-end">
                  <button class="btn btn-sm btn-success me-2"
                          (click)="atualizar(m.id, d.value, v.value, da.value)"
                          [disabled]="carregando()">Salvar</button>

                  <button class="btn btn-sm btn-outline-danger"
                          (click)="remover(m.id)"
                          [disabled]="carregando()">Excluir</button>
                </td>
              </tr>

              <tr *ngIf="!metas().length">
                <td colspan="5" class="text-center text-muted py-4">
                  Nenhuma meta cadastrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class MetaFinanceirasComponent {
  private api = inject(MetaFinanceirasService);

  filtro = signal('');
  carregando = signal(false);
  erro = signal<string | null>(null);

  metas = signal<MetaFinanceira[]>([]);

  metasFiltradas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    const arr = this.metas();
    if (!f) return arr;

    return arr.filter(m =>
      (m.descricaoMeta ?? '').toLowerCase().includes(f) ||
      String(m.valorMeta ?? '').toLowerCase().includes(f) ||
      (m.dataAlvo ?? '').toLowerCase().includes(f)
    );
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando.set(true);
    this.erro.set(null);

    this.api.listar().subscribe({
      next: (data) => { this.metas.set(data ?? []); this.carregando.set(false); },
      error: () => { this.erro.set('Falha ao carregar'); this.carregando.set(false); },
    });
  }

  criar(descricaoMeta: string, valorMeta: string | number, dataAlvoInput: string) {
    if (!descricaoMeta?.trim()) return;

    const body = {
      descricaoMeta: descricaoMeta.trim(),
      valorMeta: Number(valorMeta ?? 0),
      dataAlvo: this.fromInputDate(dataAlvoInput), 
    };

    this.carregando.set(true);
    this.erro.set(null);
    this.api.criar(body).subscribe({
      next: () => this.carregar(),
      error: () => { this.erro.set('Falha ao criar'); this.carregando.set(false); },
    });
  }

  atualizar(id: number, descricaoMeta: string, valorMeta: string | number, dataAlvoInput: string) {
    const body: Partial<MetaFinanceira> = {
      descricaoMeta: (descricaoMeta ?? '').trim(),
      valorMeta: Number(valorMeta ?? 0),
      dataAlvo: this.fromInputDate(dataAlvoInput), // dd/MM/yyyy
    };

    this.carregando.set(true);
    this.erro.set(null);
    this.api.atualizar(id, body).subscribe({
      next: () => this.carregar(),
      error: () => { this.erro.set('Falha ao atualizar'); this.carregando.set(false); },
    });
  }

  remover(id: number) {
    this.carregando.set(true);
    this.erro.set(null);
    this.api.remover(id).subscribe({
      next: () => this.carregar(),
      error: () => { this.erro.set('Falha ao excluir'); this.carregando.set(false); },
    });
  }

  /** Converte "dd/MM/yyyy" ou "yyyy-MM-dd" para valor do <input type="date"> ("yyyy-MM-dd") */
  toInputDate(d: string | null | undefined): string {
    if (!d) return '';
    // já está ISO?
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    // dd/MM/yyyy -> yyyy-MM-dd
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    // fallback: tenta Date
    const dt = new Date(d);
    if (isNaN(+dt)) return '';
    const y = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  /** Converte valor vindo do <input type="date"> (yyyy-MM-dd) para "dd/MM/yyyy" (compatível com @JsonFormat) */
  private fromInputDate(iso: string | Date): string {
    if (!iso) return '';
    const s = typeof iso === 'string' ? iso : this.toIsoDate(iso);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return '';
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }
}
