package com.curso.Coinkeeper.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;

public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JWTAuthenticationFilter.class);

    private final JWTUtils jwtUtils;

    public JWTAuthenticationFilter(JWTUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String path = request.getServletPath();
        final String method = request.getMethod();

        // 1) Ignore rotas públicas e OPTIONS
        if (path.startsWith("/auth/")
                || path.startsWith("/api/auth/")
                || path.startsWith("/h2-console")
                || "OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2) Leia UMA vez o header
        final String header = request.getHeader("Authorization");

        // 3) Sem Bearer? apenas siga a cadeia (não bloqueie aqui)
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4) Validar token e autenticar
        final String token = header.substring(7); // <- é substring(7), sem "beginIndex:"
        try {
            // --- AJUSTE ESTES NOMES SEU JWTUtils TIVER OUTROS ---
            final String username = jwtUtils.getUsername(token);  // ex.: extractUsername / getSubject
            final boolean valid   = jwtUtils.isTokenValid(token); // ex.: validateToken / isValid
            // -----------------------------------------------------

            if (valid && username != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Se não extrai perfis do token, mande vazio mas TIPADO:
                Collection<GrantedAuthority> authorities = Collections.emptyList();

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            // Não responda 403 aqui; apenas logue e deixe o Security decidir
            log.debug("Falha ao validar JWT: {}", e.getMessage());
        }

        // 5) Continue a cadeia
        filterChain.doFilter(request, response);
    }
}
