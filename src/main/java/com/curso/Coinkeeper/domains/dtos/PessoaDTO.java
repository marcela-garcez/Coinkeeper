package com.curso.Coinkeeper.domains.dtos;

import com.curso.Coinkeeper.domains.Pessoa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PessoaDTO {


    private Long id;

    @NotNull (message = "O campo valor do razao social não pode ser nulo")
    @NotBlank (message = "O campo valor do razao social não pode ser vazio")
    private String razaoSocial;

    public PessoaDTO() {
    }

    public PessoaDTO(Pessoa pessoa) {
        this.id = pessoa.getId();
        this.razaoSocial = pessoa.getRazaoSocial();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public @NotNull(message = "O campo valor do razao social não pode ser nulo") @NotBlank(message = "O campo valor do razao social não pode ser vazio") String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(@NotNull(message = "O campo valor do razao social não pode ser nulo") @NotBlank(message = "O campo valor do razao social não pode ser vazio") String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }
}