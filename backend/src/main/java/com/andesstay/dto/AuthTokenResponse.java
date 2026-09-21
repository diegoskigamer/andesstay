package com.andesstay.dto;

/**
 * Lo que el backend le devuelve al FRONTEND (camelCase, JS-friendly).
 * Distinto de CognitoTokenResponse, que es lo que Cognito nos devuelve a
 * NOSOTROS (snake_case). Separar ambos evita mezclar los dos formatos.
 */
public class AuthTokenResponse {

    private final String idToken;
    private final String accessToken;
    private final String refreshToken;
    private final Integer expiresIn;
    private final String tokenType;

    public AuthTokenResponse(String idToken, String accessToken, String refreshToken,
                              Integer expiresIn, String tokenType) {
        this.idToken = idToken;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType;
    }

    public String getIdToken() { return idToken; }
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public Integer getExpiresIn() { return expiresIn; }
    public String getTokenType() { return tokenType; }
}