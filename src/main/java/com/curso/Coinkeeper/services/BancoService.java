package com.curso.Coinkeeper.services;

import com.curso.Coinkeeper.domains.Banco;
import com.curso.Coinkeeper.domains.dtos.BancoDTO;
import com.curso.Coinkeeper.repositories.BancoRepository;
import com.curso.Coinkeeper.services.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BancoService {

    @Autowired
    private BancoRepository bancoRepo;

    public List<BancoDTO> findAll(){
        //retorna uma lista de GrupoProdutoDRO
        return bancoRepo.findAll().stream()
                .map(obj -> new BancoDTO(obj))
                .collect(Collectors.toList());
    }

    public Banco findbyId(Long id){
        Optional<Banco> obj = bancoRepo.findById(id);
        return obj.orElseThrow(() -> new ObjectNotFoundException("Banco não encontrado! ID: "+ id));
    }

    public Banco create(BancoDTO dto){
        dto.setId(null);
        Banco obj = new Banco(dto);
        return bancoRepo.save(obj);
    }

    public Banco update(Long id, BancoDTO objDto){
        objDto.setId(id);
        Banco oldObj = findbyId(id);
        oldObj = new Banco(objDto);
        return bancoRepo.save(oldObj);
    }

    public void delete (Long id){
        Banco obj = findbyId(id);
        bancoRepo.deleteById(id);
    }

}
