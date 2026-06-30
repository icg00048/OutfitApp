package io.outfit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS Configuration for OutfitApp Backend
 * 
 * Allows requests from:
 * - Local development (http/https://localhost:*)
 * - Capacitor mobile apps (capacitor://localhost, ionic://localhost)
 * - CloudFlare tunnel preview URLs (https://*.trycloudflare.com)
 * 
 * This enables seamless communication between the Angular/Ionic frontend
 * running on iOS, Android, Web, and the Spring Boot backend.
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
      .addMapping("/**")
      // Allow Capacitor/Ionic mobile origins
      .allowedOriginPatterns(
        "capacitor://localhost",
        "ionic://localhost",
        // Local development
        "http://localhost:*",
        "https://localhost:*",
        // CloudFlare tunnel (URL pattern changes, so use wildcard)
        "https://*.trycloudflare.com",
        // Browser dev (PC)
        "http://127.0.0.1:*",
        "https://127.0.0.1:*"
      )
      // Allow all HTTP methods
      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
      // Allow all headers
      .allowedHeaders("*")
      // Allow credentials (cookies, auth headers)
      .allowCredentials(true)
      // Cache preflight response for 1 hour
      .maxAge(3600);
  }
}
