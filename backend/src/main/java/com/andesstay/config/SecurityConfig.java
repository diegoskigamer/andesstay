package com.andesstay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Seguridad de la API para el flujo Cognito federado con Azure AD.
 *
 * El rol del usuario viaja en el claim "custom:role" del id_token de
 * Cognito. Azure AD lo manda como lista (ej: ["Admin"]), y Cognito a
 * veces lo guarda como el STRING LITERAL '["Admin"]' en vez de una lista
 * real — por eso hay que "desempacar" ese formato acá también (mismo
 * problema que se resolvió en el frontend, ver CognitoSessionProvider.jsx).
 *
 * TOGGLE: mientras `andesstay.security.enabled=false` (default, ver
 * application.yml), todos los endpoints quedan abiertos. Para activarla,
 * setear como variables de entorno:
 *   1) ANDESSTAY_SECURITY_ENABLED=true
 *   2) SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=
 *        https://cognito-idp.<region>.amazonaws.com/<userPoolId>
 * (ver instrucciones completas en backend/README.md)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final List<String> ROLE_CLAIM_CANDIDATES = List.of("custom:role", "cognito:groups", "roles");

    @Value("${andesstay.security.enabled:false}")
    private boolean securityEnabled;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        if (!securityEnabled) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                    .csrf(AbstractHttpConfigurer::disable);
            return http.build();
        }

        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/catalog/units").authenticated()
                        .requestMatchers("/api/catalog/**").hasAnyRole("Admin", "admin")
                        .requestMatchers("/api/report/**").hasAnyRole("Admin", "admin")
                        .requestMatchers("/api/audit/**").hasAnyRole("Admin", "admin", "Auditor")
                        .requestMatchers("/api/reservations/**").hasAnyRole("Admin", "admin", "Recepcionista", "Huesped")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> scopeAuthorities = scopesConverter.convert(jwt);
            List<GrantedAuthority> result = new ArrayList<>(
                    scopeAuthorities == null ? List.of() : scopeAuthorities);

            for (String claimName : ROLE_CLAIM_CANDIDATES) {
                if (!jwt.hasClaim(claimName)) continue;
                for (String role : parseRoleClaim(jwt.getClaim(claimName))) {
                    result.add(new SimpleGrantedAuthority("ROLE_" + role));
                }
            }

            return result.stream().distinct().collect(Collectors.toList());
        });

        return converter;
    }

    /**
     * Soporta 3 formatos posibles del claim de rol:
     * - Lista real: ["Admin"]
     * - String simple: "Admin"
     * - String con formato JSON de lista (bug típico de Cognito al mapear
     *   un claim array a un atributo de texto): "[\"Admin\"]"
     */
    @SuppressWarnings("unchecked")
    private List<String> parseRoleClaim(Object rawValue) {
        if (rawValue == null) return List.of();

        if (rawValue instanceof List<?> list) {
            return list.stream().map(String::valueOf).collect(Collectors.toList());
        }

        if (rawValue instanceof String str) {
            String trimmed = str.trim();
            if (trimmed.startsWith("[")) {
                String inner = trimmed.replaceAll("^\\[\"?|\"?]$", "");
                List<String> values = new ArrayList<>();
                for (String part : inner.split(",")) {
                    String cleaned = part.trim().replaceAll("^\"|\"$", "");
                    if (!cleaned.isBlank()) values.add(cleaned);
                }
                return values;
            }
            return List.of(trimmed);
        }

        return List.of(String.valueOf(rawValue));
    }
}