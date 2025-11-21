package com.curso.Coinkeeper.domains;

import com.curso.Coinkeeper.domains.dtos.CentroCustoDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
@Table(name = "centrocusto")
public class CentroCusto {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_centrocusto")
    private Long id;

    @NotNull @NotBlank
    private String descricao;

    public CentroCusto() {
    }

    public CentroCusto(Long id, String descricao) {
        this.id = id;
        this.descricao = descricao;
    }

    public CentroCusto(CentroCustoDTO dto) {
        this.id = dto.getId();
        this.descricao = dto.getDescricao();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public @NotNull @NotBlank String getDescricao() {
        return descricao;
    }

    public void setDescricao(@NotNull @NotBlank String descricao) {
        this.descricao = descricao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CentroCusto that = (CentroCusto) o;
        return id == that.id && Objects.equals(descricao, that.descricao);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, descricao);
    }
}
