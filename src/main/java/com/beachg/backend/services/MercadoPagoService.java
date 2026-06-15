package com.beachg.backend.services;

import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.core.MPRequestOptions;
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

    public String createPaymentPreference(String title, Double unitPrice, Integer quantity,
                                          String successUrl, String pendingUrl, String failureUrl,
                                          Long bookingId) {

        // 1. Creamos el item
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .title(title)
                .quantity(quantity)
                .unitPrice(new BigDecimal(unitPrice))
                .currencyId("ARS")
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        // 2. Configuramos las URLs de retorno
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(successUrl)
                .pending(pendingUrl)
                .failure(failureUrl)
                .build();

        // 3. Armamos la solicitud de preferencia
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved")
                .externalReference(bookingId.toString())
                .build();

        // ==========================================================
        //  FORZAR EL TOKEN EN ESTA PETICIÓN ESPECÍFICA
        // ==========================================================
        MPRequestOptions requestOptions = MPRequestOptions.builder()
                .accessToken(accessToken)
                .build();

        PreferenceClient client = new PreferenceClient();
        try {
            // ACÁ PASAMOS EL REQUEST OPTIONS COMO SEGUNDO PARÁMETRO
            Preference preference = client.create(preferenceRequest, requestOptions);
            return preference.getInitPoint();
        } catch (com.mercadopago.exceptions.MPApiException apiException) {
            System.err.println("❌ ERROR DE MERCADO PAGO: " + apiException.getApiResponse().getContent());
            throw new RuntimeException("Error en la API de Mercado Pago");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al crear la preferencia de pago: " + e.getMessage());
        }
    }
}