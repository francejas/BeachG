package com.beachg.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "BeachG API",
        version = "1.0",
        description = "API REST para la gestión de balnearios: reservas, clientes, unidades de alquiler, amenidades y validación de acceso por QR.",
        contact = @Contact(
            name = "BeachG · UTN",
            email = "admin@beachg.com"
        )
    ),
    servers = {
        @Server(url = "/", description = "Servidor actual")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT obtenido desde POST /api/auth/login. Formato: Bearer <token>"
)
public class OpenApiConfig {
}
