package com.curso.Coinkeeper.services;

import com.curso.Coinkeeper.domains.Pessoa;
import com.curso.Coinkeeper.domains.dtos.PessoaDTO;
import com.curso.Coinkeeper.repositories.PessoaRepository;
import com.curso.Coinkeeper.services.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PessoaService {

    @Autowired
    private PessoaRepository terceiroRepo;

    public List<PessoaDTO> findAll(){
        return terceiroRepo.findAll().stream()
                .map(obj -> new PessoaDTO(obj))
                .collect(Collectors.toList());
    }

    public Pessoa findbyId(Long id){
        Optional<Pessoa> obj = terceiroRepo.findById(id);
        return obj.orElseThrow(() -> new ObjectNotFoundException("Pessoa não encontrada! ID: "+ id));
    }

    public Pessoa create(PessoaDTO dto){
        dto.setId(null);
        Pessoa obj = new Pessoa(dto);
        return terceiroRepo.save(obj);
    }

    public Pessoa update(Long id, PessoaDTO objDto){
        objDto.setId(id);
        Pessoa oldObj = findbyId(id);
        oldObj = new Pessoa(objDto);
        return terceiroRepo.save(oldObj);
    }

    public void delete (Long id){
        Pessoa obj = findbyId(id);
        terceiroRepo.deleteById(id);
    }

}
