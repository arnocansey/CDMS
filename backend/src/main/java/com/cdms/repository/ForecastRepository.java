package com.cdms.repository;

import com.cdms.entity.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, Long> {
    List<Forecast> findByForecastType(String forecastType);
    List<Forecast> findByForecastDateBetween(LocalDate startDate, LocalDate endDate);
    Optional<Forecast> findTopByForecastTypeOrderByForecastDateDesc(String forecastType);
}
