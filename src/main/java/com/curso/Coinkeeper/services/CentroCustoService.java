package com.curso.Coinkeeper.services;

import com.curso.Coinkeeper.domains.CentroCusto;
import com.curso.Coinkeeper.domains.dtos.CentroCustoDTO;
import com.curso.Coinkeeper.repositories.CentroCustoRepository;
import com.curso.Coinkeeper.services.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CentroCustoService {

    @Autowired
    private CentroCustoRepository centroCustoRepo;

    public List<CentroCustoDTO> findAll(){
        //retorna uma lista de GrupoProdutoDRO
        return centroCustoRepo.findAll().stream()
                .map(obj -> new CentroCustoDTO(obj))
                .collect(Collectors.toList());
    }

    public CentroCusto findbyId(Long id){
        Optional<CentroCusto> obj = centroCustoRepo.findById(id);
        return obj.orElseThrow(() -> new ObjectNotFoundException("Centro de Custo não encontrado! ID: "+ id));
    }

    public CentroCusto create(CentroCustoDTO dto){
        dto.setId(null);
        CentroCusto obj = new CentroCusto(dto);
        return centroCustoRepo.save(obj);
    }

    public CentroCusto update(Long id, CentroCustoDTO objDto){
        objDto.setId(id);
        CentroCusto oldObj = findbyId(id);
        oldObj = new CentroCusto(objDto);
        return centroCustoRepo.save(oldObj);
    }

    public void delete (Long id){
        CentroCusto obj = findbyId(id);
        centroCustoRepo.deleteById(id);
    }

}
