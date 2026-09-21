package com.andesstay.controller;

import com.andesstay.dto.AuthTokenResponse;
import com.andesstay.dto.CognitoCallbackRequest;
import com.andesstay.dto.CognitoTokenResponse;
import com.andesstay.service.CognitoAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Único endpoint público de autenticación. El frontend le manda el "code"
 * que recibió de Cognito (después del login federado con Azure AD), y acá
 * lo cambiamos por tokens reales usando el client secret (que nunca sale
 * del backend). Ver CognitoAuthService.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CognitoAuthService cognitoAuthService;

    public AuthController(CognitoAuthService cognitoAuthService) {
        this.cognitoAuthService = cognitoAuthService;
    }

    @PostMapping("/cognito/callback")
    public AuthTokenResponse cognitoCallback(@Valid @RequestBody CognitoCallbackRequest request) {
        CognitoTokenResponse tokens = cognitoAuthService.exchangeCodeForTokens(request.getCode(), request.getRedirectUri());
        return new AuthTokenResponse(
                tokens.getIdToken(),
                tokens.getAccessToken(),
                tokens.getRefreshToken(),
                tokens.getExpiresIn(),
                tokens.getTokenType()
        );
    }
}