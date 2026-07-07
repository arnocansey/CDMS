package com.cdms.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class ApiKeyAuthenticationToken extends AbstractAuthenticationToken {
    private final String keyName;
    private final Long churchId;

    public ApiKeyAuthenticationToken(String keyName, Long churchId, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.keyName = keyName;
        this.churchId = churchId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return keyName;
    }

    public Long getChurchId() {
        return churchId;
    }
}
