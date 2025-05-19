package com.example.demo.security.jwt;

import com.example.demo.service.impl.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            logger.debug("===== Requête reçue pour: {} {} =====", request.getMethod(), request.getRequestURI());
            
            // Afficher tous les en-têtes pour le débogage
            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                logger.debug("En-têtes de la requête:");
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    String headerValue = request.getHeader(headerName);
                    // Mask the authorization token for security
                    if ("authorization".equalsIgnoreCase(headerName) && headerValue != null && headerValue.length() > 10) {
                        logger.debug("  {} : {}...", headerName, headerValue.substring(0, 10));
                    } else {
                        logger.debug("  {} : {}", headerName, headerValue);
                    }
                }
            }
            
            String jwt = parseJwt(request);
            
            if (jwt != null) {
                logger.debug("JWT trouvé dans la requête: {}...", jwt.substring(0, Math.min(20, jwt.length())));
                
                try {
                    if (jwtUtils.validateJwtToken(jwt)) {
                        String username = jwtUtils.getUserNameFromJwtToken(jwt);
                        logger.debug("JWT valide pour l'utilisateur: {}", username);

                        try {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                            logger.debug("Utilisateur chargé avec succès: {}, rôles: {}", username, userDetails.getAuthorities());
                            
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            logger.debug("Authentification réussie pour l'utilisateur: {}, avec les autorisations: {}", 
                                username, userDetails.getAuthorities());
                        } catch (Exception e) {
                            logger.error("Erreur lors du chargement de l'utilisateur: {}", e.getMessage(), e);
                        }
                    } else {
                        logger.error("JWT non valide - Validation échouée");
                    }
                } catch (Exception e) {
                    logger.error("Erreur lors de la validation du token JWT: {}", e.getMessage(), e);
                }
            } else {
                logger.debug("Aucun JWT dans la requête");
            }
        } catch (Exception e) {
            logger.error("Erreur d'authentification globale: {}", e.getMessage(), e);
        }

        // Afficher l'état d'authentification avant de continuer
        logger.debug("État d'authentification: {}", 
            SecurityContextHolder.getContext().getAuthentication() != null ? 
            "Authentifié comme " + SecurityContextHolder.getContext().getAuthentication().getName() : 
            "Non authentifié");

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        logger.debug("En-tête Authorization: {}", headerAuth);

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            logger.debug("Token JWT extrait, longueur: {}", token.length());
            return token;
        }

        return null;
    }
} 