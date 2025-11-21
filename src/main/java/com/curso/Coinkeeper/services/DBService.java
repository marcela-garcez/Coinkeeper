package com.curso.Coinkeeper.services;

import com.curso.Coinkeeper.domains.*;
import com.curso.Coinkeeper.domains.enums.Situacao;
import com.curso.Coinkeeper.domains.enums.TipoConta;
import com.curso.Coinkeeper.domains.enums.TipoLancamento;
import com.curso.Coinkeeper.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

import static com.curso.Coinkeeper.domains.enums.PersonType.ADMIN;
import static com.curso.Coinkeeper.domains.enums.PersonType.USER;

@Service
public class DBService {

    @Autowired
    private BancoRepository bancoRepo;

    @Autowired
    private CentroCustoRepository centroCustoRepo;

    @Autowired
    private ContaRepository contaRepo;

    @Autowired
    private LancamentoRepository lancamentoRepo;

    @Autowired
    private PessoaRepository pessoaRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private PasswordEncoder encoder;

    public void initDB() {

        Banco banco01 = new Banco(null, "Banco do Brasil");
        Banco banco02 = new Banco(null, "Bradesco");
        Banco banco03 = new Banco(null, "Santander");

        CentroCusto centroCusto01 = new CentroCusto(null, "Conserto do Carro");
        CentroCusto centroCusto02 = new CentroCusto(null, "Compras Casa");
        CentroCusto centroCusto03 = new CentroCusto(null, "Estetica Automotiva");

        Pessoa pessoa01 = new Pessoa(null, "Fornecedor Barueri");
        Pessoa pessoa02 = new Pessoa(null, "Mercado leve mais");
        Pessoa pessoa03 = new Pessoa(null, "Vonixx LTDA");

        Usuario usuario01 = new Usuario(null, "Richard", "richard@email.com",encoder.encode("1234"));
        usuario01.addPersonType(USER);
        usuario01.addPersonType(ADMIN);

        Usuario usuario02 = new Usuario(null, "Marcela", "marcela@email.com",encoder.encode("1234"));
        usuario02.addPersonType(USER);
        usuario02.addPersonType(ADMIN);

        Conta conta01 = new Conta(null, "Conta Principal", new BigDecimal("1.00"), new BigDecimal("12000.00"), TipoConta.CONTA_CORRENTE, usuario01, banco01);
        Conta conta02 = new Conta(null, "Conta Pagamentos", new BigDecimal("1.00"), new BigDecimal("12000.00"), TipoConta.CARTAO_ALIMENTACAO, usuario02, banco03);

        Lancamento lancamento01 = new Lancamento(null, "Troca Óleo", "1/2", LocalDate.of(2025, 10, 19), LocalDate.of(2025, 10, 19), LocalDate.of(2025, 10, 19), new BigDecimal("260.00"), new BigDecimal("80.00"), TipoLancamento.CREDITO, Situacao.ABERTO, pessoa01, centroCusto01, conta01);
        Lancamento lancamento02 = new Lancamento(null, "Janta", "1", LocalDate.of(2025, 10, 19), LocalDate.of(2025, 10, 19), LocalDate.of(2025, 10, 19), new BigDecimal("60.00"), new BigDecimal("60.00"), TipoLancamento.DEBITO, Situacao.BAIXADO, pessoa02, centroCusto02, conta02);
        Lancamento lancamento03 = new Lancamento(null, "V-Floc", "1", LocalDate.of(2025, 10, 19), LocalDate.of(2025, 10, 19), LocalDate.of(2025, 10, 19), new BigDecimal("80.00"), new BigDecimal("80.00"), TipoLancamento.DEBITO, Situacao.BAIXADO, pessoa01, centroCusto03, conta01);



        bancoRepo.save(banco01);
        bancoRepo.save(banco02);
        bancoRepo.save(banco03);
        centroCustoRepo.save(centroCusto01);
        centroCustoRepo.save(centroCusto02);
        centroCustoRepo.save(centroCusto03);
        pessoaRepo.save(pessoa01);
        pessoaRepo.save(pessoa02);
        pessoaRepo.save(pessoa03);
        usuarioRepo.save(usuario01);
        usuarioRepo.save(usuario02);
        contaRepo.save(conta01);
        contaRepo.save(conta02);
        lancamentoRepo.save(lancamento01);
        lancamentoRepo.save(lancamento02);
        lancamentoRepo.save(lancamento03);
    }
}
