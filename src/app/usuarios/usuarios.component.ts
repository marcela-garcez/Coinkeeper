import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UsuariosService, UsuarioDTO } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styles: [`
    :host { display:block; }
  `]
})
export class UsuariosComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(UsuariosService);

  usuarios: UsuarioDTO[] = [];
  loading = false;
  error = '';

  form = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    personType: this.fb.control<string[]>(['USER'])
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading = true; this.error = '';
    this.api.list().subscribe({
      next: (data) => { this.usuarios = data; this.loading = false; },
      error: () => { this.error = 'Falha ao carregar'; this.loading = false; }
    });
  }

  criar() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.api.create(this.form.value as UsuarioDTO).subscribe({
      next: () => { this.form.reset({ personType: ['USER'] }); this.carregar(); },
      error: () => { this.error = 'Falha ao criar'; this.loading = false; }
    });
  }

  atualizar(id: number, dto: UsuarioDTO) {
    this.loading = true; this.error = '';
    this.api.update(id, dto).subscribe({
      next: () => this.carregar(),
      error: () => { this.error = 'Falha ao atualizar'; this.loading = false; }
    });
  }

  remover(id: number) {
    this.loading = true; this.error = '';
    this.api.remove(id).subscribe({
      next: () => this.carregar(),
      error: () => { this.error = 'Falha ao excluir'; this.loading = false; }
    });
  }
}
