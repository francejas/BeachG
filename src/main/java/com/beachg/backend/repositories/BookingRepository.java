package com.beachg.backend.repositories;

import com.beachg.backend.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    /**
     * Verifica si una unidad de alquiler está disponible en un rango de fechas.
     * * ¿Cómo funciona la consulta?
     * 1. SELECT COUNT(b) = 0 : Busca en la base de datos y cuenta. Si el resultado es 0 (cero choques),
     * devuelve TRUE (está libre). Si encuentra 1 o más, devuelve FALSE (está ocupada).
     * * 2. Filtro 1 (La unidad): Solo busca reservas para la carpa o sombrilla específica solicitada.
     * * 3. Filtro 2 (El estado): Ignora las reservas que están canceladas (status != 'CANCELED'),
     * permitiendo que esa carpa vuelva a estar disponible en el sistema.
     * * 4. Filtro 3 (La superposición de fechas): Usa la fórmula matemática estándar para detectar choques:
     * (InicioViejo <= FinNuevo) Y (FinViejo >= InicioNuevo). Si ambas se cumplen, las fechas se pisan.
     * * Seguridad:
     * Los dos puntos (Ej: :idRentalUnit) son "Parámetros con Nombre" (Named Parameters).
     * Se usan en lugar de concatenar con "+" para prevenir ataques de inyección SQL (SQL Injection),
     * ya que Spring Boot sanitiza los valores automáticamente antes de enviarlos a MySQL.
     *
     * @param idRentalUnit ID de la unidad (carpa/sombrilla) que se quiere reservar.
     * @param startDate    Fecha de inicio deseada por el cliente.
     * @param endDate      Fecha de fin deseada por el cliente.
     * @return true si la unidad está libre, false si hay superposición de fechas.
     */
    

    @Query("SELECT COUNT(b) = 0 FROM Booking b " +
            "WHERE b.rentalUnit.idRentalUnit = :idRentalUnit " +
            "AND b.status != 'CANCELED' " +
            "AND (b.startDate <= :endDate AND b.endDate >= :startDate)")
    boolean isUnitAvailable(@Param("idRentalUnit") Long idRentalUnit,
                            @Param("startDate") LocalDate startDate,
                            @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.client.idClient = :clientId")
    List<Booking> findByClientId(@Param("clientId") Long clientId);

}