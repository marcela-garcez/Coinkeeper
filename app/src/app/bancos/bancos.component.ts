import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { BancosService, Banco } from './bancos.service';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
template: `
  <section class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h3 mb-0">Bancos</h1>

      <button class="btn btn-outline-secondary btn-sm"
              (click)="carregar()" [disabled]="loading">
        <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
        Recarregar
      </button>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="criar()" class="row g-2 align-items-center">
          <div class="col-sm-8 col-md-6">
            <input formControlName="razaoSocial" class="form-control"
                   placeholder="Razão Social" />
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-primary"
                    [disabled]="form.invalid || loading">
              Criar
            </button>
          </div>
        </form>

        <div *ngIf="error" class="alert alert-danger mt-3 py-2 mb-0">
          {{ error }}
        </div>
      </div>
    </div>

    <div class="card shadow-sm mt-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 80px;">ID</th>
                <th>Razão Social</th>
                <th class="text-end" style="width: 220px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bancos">
                <td class="text-muted">#{{ b.id }}</td>
                <td>
                  <input [value]="b.razaoSocial" #novo
                         class="form-control form-control-sm" />
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-success me-2"
                          (click)="atualizar(b.id, novo.value)"
                          [disabled]="loading">
                    Salvar
                  </button>
                  <button class="btn btn-sm btn-outline-danger"
                          (click)="remover(b.id)"
                          [disabled]="loading">
                    Excluir
                  </button>
                </td>
              </tr>

              <tr *ngIf="!bancos?.length">
                <td colspan="3" class="text-center text-muted py-4">
                  Nenhum banco cadastrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
    :host { display:block; }
  `]
})
export class BancosComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(BancosService);

  bancos: Banco[] = [];
  loading = false;
  error = '';

  form = this.fb.group({
    razaoSocial: ['', [Validators.required]],   // <-- agora é string (não null)
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading = true; this.error = '';
    this.api.listar().subscribe({
      next: (data) => { this.bancos = data; this.loading = false; },
      error: (e) => { this.error = 'Falha ao carregar'; this.loading = false; }
    });
  }

  criar() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.api.criar(this.form.value).subscribe({
      next: () => { this.form.reset(); this.carregar(); },
      error: () => { this.error = 'Falha ao criar'; this.loading = false; }
    });
  }

  atualizar(id: number, razaoSocial: string) {
    this.loading = true; this.error = '';
    this.api.atualizar(id, { razaoSocial }).subscribe({
      next: () => { this.carregar(); },
      error: () => { this.error = 'Falha ao atualizar'; this.loading = false; }
    });
  }

  remover(id: number) {
    this.loading = true; this.error = '';
    this.api.remover(id).subscribe({
      next: () => { this.carregar(); },
      error: () => { this.error = 'Falha ao excluir'; this.loading = false; }
    });
  }
}
