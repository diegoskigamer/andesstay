package com.andesstay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS abierto para desarrollo local del frontend React (Vite, puerto 5173).
 * Cuando se agregue Azure AD + API Gateway, el flujo real será:
 * JWT -> API Gateway -> ms-andesstay-bff -> microservicio de dominio,
 * y este CORS se ajusta o se elimina (el navegador solo hablará con el BFF).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
