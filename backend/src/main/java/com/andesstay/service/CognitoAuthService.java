package com.andesstay.service;

import com.andesstay.dto.CognitoTokenResponse;
import com.andesstay.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Intercambia el "code" que Cognito manda al frontend (después del login
 * federado con Azure AD) por los tokens reales (id_token/access_token).
 *
 * Este es el ÚNICO lugar donde se usa el client secret de Cognito — nunca
 * viaja al navegador. El frontend solo nos manda el code, y nosotros
 * hablamos con Cognito de servidor a servidor.
 */
@Service
public class CognitoAuthService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${cognito.domain}")
    private String cognitoDomain;

    @Value("${cognito.client-id}")
    private String clientId;

    @Value("${cognito.client-secret}")
    private String clientSecret;

    public CognitoTokenResponse exchangeCodeForTokens(String code, String redirectUri) {
        if (cognitoDomain == null || cognitoDomain.isBlank()
                || clientId == null || clientId.isBlank()
                || clientSecret == null || clientSecret.isBlank()) {
            throw new BusinessException(
                    "Cognito no está configurado en el backend. Faltan COGNITO_DOMAIN / " +
                    "COGNITO_CLIENT_ID / COGNITO_CLIENT_SECRET como variables de entorno.");
        }

        String tokenUrl = "https://" + cognitoDomain + "/oauth2/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(basicAuthHeader());

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("code", code);
        body.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            var response = restTemplate.postForEntity(tokenUrl, request, CognitoTokenResponse.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new BusinessException("Cognito no devolvió tokens válidos.");
            }
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new BusinessException(
                    "Cognito rechazó el intercambio de código: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        }
    }

    private String basicAuthHeader() {
        String raw = clientId + ":" + clientSecret;
        return Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }
}