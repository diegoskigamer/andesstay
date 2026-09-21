package com.andesstay.dto;

import jakarta.validation.constraints.NotBlank;


public class CognitoCallbackRequest {

    @NotBlank(message = "code es obligatorio")
    private String code;

    @NotBlank(message = "redirectUri es obligatorio")
    private String redirectUri;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getRedirectUri() { return redirectUri; }
    public void setRedirectUri(String redirectUri) { this.redirectUri = redirectUri; }
}