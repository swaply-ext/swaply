package com.swaply.backend.config.security;

import com.swaply.backend.shared.UserCRUD.Model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;

public class SecurityUser implements UserDetails {

    private final User user;

    public SecurityUser(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        if (user.isPremium()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_PREMIUM"));
        }
        if (user.isModerator()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_MODERATOR"));
        }
        
        return authorities;
    }

    public String getId() { //no se si esto debería ir aquí
        return user.getId();
    }

    @Override
    public String getPassword() {

        return user.getPassword();
    }

    @Override
    public String getUsername() {

        return user.getId();
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}