package com.example.demo.security.jwt;

import com.example.demo.service.impl.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${ajenda.app.jwtSecret}")
    private String jwtSecret;

    @Value("${ajenda.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        logger.debug("Génération du token JWT pour l'utilisateur: {}", userPrincipal.getUsername());
        
        String token = Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
        
        logger.debug("Token JWT généré avec succès");
        return token;
    }
    
    private Key key() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            logger.debug("Clé secrète décodée avec succès, longueur: {} bytes", keyBytes.length);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("Erreur lors de la création de la clé JWT: {}", e.getMessage(), e);
            throw e;
        }
    }

    public String getUserNameFromJwtToken(String token) {
        try {
            String username = Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            logger.debug("Nom d'utilisateur extrait du token JWT: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction du nom d'utilisateur du token: {}", e.getMessage());
            throw e;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            if (authToken == null) {
                logger.error("Le token est null");
                return false;
            }
            
            logger.debug("Validation du token JWT: {}", authToken.substring(0, Math.min(10, authToken.length())) + "...");
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(authToken)
                    .getBody();
            
            String subject = claims.getSubject();
            Date issuedAt = claims.getIssuedAt();
            Date expiration = claims.getExpiration();
            Date now = new Date();
            
            logger.debug("Token JWT décodé: subject={}, issuedAt={}, expiration={}, currentTime={}", 
                    subject, issuedAt, expiration, now);
                    
            if (expiration.before(now)) {
                logger.error("Le token est expiré: expiration={}, currentTime={}", expiration, now);
                return false;
            }
            
            logger.debug("JWT token valide");
            return true;
        } catch (SignatureException e) {
            logger.error("Signature JWT invalide: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Token JWT malformé: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims vide: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Erreur non gérée lors de la validation du token JWT: {}", e.getMessage(), e);
        }

        return false;
    }
} 