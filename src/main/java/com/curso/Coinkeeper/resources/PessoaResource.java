package com.curso.Coinkeeper.resources;

import com.curso.Coinkeeper.domains.Pessoa;
import com.curso.Coinkeeper.domains.dtos.PessoaDTO;
import com.curso.Coinkeeper.services.PessoaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pessoas")
@Tag(name="Pessoas", description = "API para Gerenciamento de pessoas")
public class PessoaResource {

    @Autowired
    private PessoaService pessoaService;

    @GetMapping
    @Operation(summary = "Listar todos as pessoas", description = "Retorna uma lista com todos as pessoas cadastradas")
    public ResponseEntity<List<PessoaDTO>> findAll(){
        return ResponseEntity.ok().body(pessoaService.findAll());
    }

    @GetMapping(value = "/{id}")
    @Operation(summary = "Listar as pessoas por id", description = "Retorna uma lista das pessoas cadastradas por id")
    public ResponseEntity<PessoaDTO> findbyId(@PathVariable Long id){
        Pessoa obj = this.pessoaService.findbyId(id);
        return ResponseEntity.ok().body(new PessoaDTO(obj));
    }

    @PostMapping
    @Operation(summary = "Cria novas pessoas", description = "Cria uma nova pessoa com base nos dados fornecidos")
    public ResponseEntity<PessoaDTO> create(@Valid @RequestBody PessoaDTO dto){
        Pessoa pessoa = pessoaService.create(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(pessoa.getId()).toUri();

        return ResponseEntity.created(uri).build();
    }

    @PutMapping(value = "/{id}")
    @Operation(summary = "Altera uma pessoa", description = "Altera uma pessoa cadastrada")
    public ResponseEntity<PessoaDTO> update(@PathVariable Long id, @Valid @RequestBody PessoaDTO objDto){
        Pessoa Obj = pessoaService.update(id, objDto);
        return ResponseEntity.ok().body(new PessoaDTO(Obj));
    }

    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Deleta uma pessoa cadastrada", description = "Remove uma pessoa cadastrado a partir do id")
    public ResponseEntity<PessoaDTO> delete(@PathVariable Long id){
        pessoaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
