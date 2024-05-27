package edu.ucsb.cs156.happiercows.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * This class is used to configure Spring Security. 
 * 
 * Among other things, this class is partially responsible for 
 * the implementation of the ADMIN_EMAILS feature.
 */

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {

  @Value("${app.admin.emails}")
  private final List<String> adminEmails = new ArrayList<>();

  @Autowired
  UserRepository userRepository;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.exceptionHandling(handling -> handling.authenticationEntryPoint(new Http403ForbiddenEntryPoint())).oauth2Login(
            oauth2 -> oauth2.userInfoEndpoint(userInfo -> userInfo.userAuthoritiesMapper(this.userAuthoritiesMapper())))
        .csrf(csrf -> csrf
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler()))
        .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .logout(logout -> logout.logoutRequestMatcher(new AntPathRequestMatcher("/logout")).logoutSuccessUrl("/"));
    return http.build();
  }

  @Bean
  public void WebSecurityCustomizer webSecurityCustomizer(){
    return web -> web.ignoring().requestMatchers("/h2-console/**");
  }

  private GrantedAuthoritiesMapper userAuthoritiesMapper() {
    return (authorities) -> {
      Set<GrantedAuthority> mappedAuthorities = new HashSet<>();

      authorities.forEach(authority -> {
        log.info("********** authority={}", authority);
        mappedAuthorities.add(authority);
        if (OAuth2UserAuthority.class.isInstance(authority)) {
          OAuth2UserAuthority oauth2UserAuthority = (OAuth2UserAuthority) authority;

          Map<String, Object> userAttributes = oauth2UserAuthority.getAttributes();
          log.info("********** userAttributes={}", userAttributes);

          String email = (String) userAttributes.get("email");
          if (isAdmin(email)) {
            mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
          }

          if (email.endsWith("@ucsb.edu")) {
            mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
          }
        }

      });
      return mappedAuthorities;
    };
  }

  public boolean isAdmin(String email) {
    if (adminEmails.contains(email)) {
      return true;
    }
    Optional<User> u = userRepository.findByEmail(email);
    return u.isPresent() && u.get().isAdmin();
  }
}