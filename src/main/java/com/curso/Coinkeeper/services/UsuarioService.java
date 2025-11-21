package com.curso.Coinkeeper.services;

import com.curso.Coinkeeper.domains.Usuario;
import com.curso.Coinkeeper.domains.dtos.UsuarioDTO;
import com.curso.Coinkeeper.repositories.UsuarioRepository;
import com.curso.Coinkeeper.services.exceptions.DataIntegrityViolationException;
import com.curso.Coinkeeper.services.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder) {
        this.usuarioRepo = repo;
        this.encoder = encoder;
    }

    public List<UsuarioDTO> findAll(){
        return usuarioRepo.findAll().stream()
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    public Usuario findbyId(Long id){
        Optional<Usuario> obj = usuarioRepo.findById(id);
        return obj.orElseThrow(() -> new ObjectNotFoundException("Usuario não encontrado! ID: " + id));
    }

    public Usuario create(UsuarioDTO dto){
        dto.setId(null);
        validateEmail(dto.getEmail());
        Usuario obj = new Usuario(dto);
        obj.setSenha(encoder.encode(obj.getSenha()));
        return usuarioRepo.save(obj);
    }

    public Usuario update(Long id, UsuarioDTO objDto){
        objDto.setId(id);
        Usuario oldObj = findbyId(id);
        validateEmail(objDto.getEmail(), id); // evita conflito ao atualizar
        oldObj = new Usuario(objDto);
        oldObj.setSenha(encoder.encode(oldObj.getSenha()));
        return usuarioRepo.save(oldObj);
    }

    public void delete(Long id){
        findbyId(id);
        usuarioRepo.deleteById(id);
    }

    private void validateEmail(String email) {
        Optional<Usuario> obj = usuarioRepo.findByEmail(email);
        if(obj.isPresent()) {
            throw new DataIntegrityViolationException("Email já cadastrado: " + email);
        }
    }

    private void validateEmail(String email, Long id) {
        Optional<Usuario> obj = usuarioRepo.findByEmail(email);
        if(obj.isPresent() && !obj.get().getId().equals(id)) {
            throw new DataIntegrityViolationException("Email já cadastrado: " + email);
        }
    }
}
