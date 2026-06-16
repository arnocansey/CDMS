package com.cdms.dto;

import java.util.List;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserDto user;
    private Long churchId;
    private String churchName;
    private String accountStatus;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, Long expiresIn, UserDto user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public AuthResponse(String accessToken, String refreshToken, Long expiresIn, UserDto user, Long churchId, String churchName) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
        this.churchId = churchId;
        this.churchName = churchName;
    }

    public AuthResponse(String accessToken, String refreshToken, Long expiresIn, UserDto user, Long churchId, String churchName, String accountStatus) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
        this.churchId = churchId;
        this.churchName = churchName;
        this.accountStatus = accountStatus;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getChurchName() { return churchName; }
    public void setChurchName(String churchName) { this.churchName = churchName; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
}
