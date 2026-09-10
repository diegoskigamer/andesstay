package com.andesstay.config;

import com.andesstay.domain.Unit;
import com.andesstay.domain.UnitType;
import com.andesstay.repository.UnitRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

/** Carga unidades de ejemplo al levantar la app, para poder probar sin pasos manuales. */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UnitRepository unitRepository) {
        return args -> {
            if (unitRepository.count() > 0) return;

            unitRepository.save(new Unit("Habitación Doble Vista Volcán", UnitType.HABITACION,
                    "Hostal Pucón Andes", 2, 6, new BigDecimal("45000")));
            unitRepository.save(new Unit("Cabaña Familiar Lago", UnitType.CABANA,
                    "Cabañas Villarrica Sur", 5, 3, new BigDecimal("95000")));
            unitRepository.save(new Unit("Habitación Compartida Trekking", UnitType.HABITACION,
                    "Hostal San Pedro Atacama", 4, 8, new BigDecimal("18000")));
            unitRepository.save(new Unit("Lodge Premium Torres", UnitType.LODGE,
                    "Lodge Torres del Paine", 4, 2, new BigDecimal("180000")));
            unitRepository.save(new Unit("Cabaña Pareja Bosque", UnitType.CABANA,
                    "Cabañas Villarrica Sur", 2, 4, new BigDecimal("60000")));
        };
    }
}
