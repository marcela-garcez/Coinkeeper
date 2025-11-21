package com.curso.Coinkeeper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@ComponentScan(basePackages = "com.curso.Coinkeeper")
@EntityScan(basePackages = {"com.curso.Coinkeeper.domains","com.curso.Coinkeeper.domains.enums"})
@EnableJpaRepositories(basePackages = "com.curso.Coinkeeper.repositories")
@SpringBootApplication
public class CoinkeeperApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoinkeeperApplication.class, args);
	}

}
