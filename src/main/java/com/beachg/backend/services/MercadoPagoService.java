package com.beachg.backend.services;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class MercadoPagoService {

    @Value("${MP_ACCESS_TOKEN}")
    private String accessToken;

    /**
     * Crea una preferencia de pago en Mercado Pago.
     * @param title Título del ítem (ej: "Reserva BeachG")
     * @param unitPrice Precio total de la reserva
     * @param quantity Cantidad (generalmente 1)
     * @param successUrl URL a la que vuelve si el pago es aprobado
     * @param pendingUrl URL a la que vuelve si el pago queda pendiente
     * @param failureUrl URL a la que vuelve si el pago es rechazado
     */
    public String createPaymentPreference(String title, Double unitPrice, Integer quantity,
                                          String successUrl, String pendingUrl, String failureUrl) {

        // 1. Configuramos el SDK con tu token
        MercadoPagoConfig.setAccessToken(accessToken);

        // 2. Creamos el item
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .title(title)
                .quantity(quantity)
                .unitPrice(new BigDecimal(unitPrice))
                .currencyId("ARS")
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        // 3. Configuramos las URLs de retorno (Back URLs)
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(successUrl)
                .pending(pendingUrl)
                .failure(failureUrl)
                .build();

        // 4. Armamos la solicitud de preferencia
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved") // Redirección automática si el pago es aprobado
                .build();

        // 5. Llamamos a Mercado Pago
        PreferenceClient client = new PreferenceClient();
        try {
            Preference preference = client.create(preferenceRequest);
            return preference.getInitPoint();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al crear la preferencia de pago: " + e.getMessage());
        }
    }
}