package com.andesstay.repository;

import com.andesstay.domain.Reservation;
import com.andesstay.domain.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("select r from Reservation r where " +
           "(:status is null or r.status = :status) and " +
           "(:from is null or r.checkInDate >= :from) and " +
           "(:to is null or r.checkOutDate <= :to) " +
           "order by r.createdAt desc")
    List<Reservation> search(@Param("status") ReservationStatus status,
                              @Param("from") LocalDate from,
                              @Param("to") LocalDate to);

    List<Reservation> findByCreatedAtAfter(LocalDateTime after);

    List<Reservation> findByStatus(ReservationStatus status);
}
