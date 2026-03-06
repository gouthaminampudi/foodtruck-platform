package com.foodtruck.modules.truck.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "truck_location")
public class TruckLocation {

    @Id
    @Column(name = "truck_id")
    private UUID truckId;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "heading_degrees")
    private BigDecimal headingDegrees;

    @Column(name = "speed_mps")
    private BigDecimal speedMps;

    @Column(name = "accuracy_meters")
    private BigDecimal accuracyMeters;

    @Column(name = "is_live", nullable = false)
    private Boolean isLive;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        updatedAt = LocalDateTime.now();
        if (isLive == null) {
            isLive = true;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getTruckId() {
        return truckId;
    }

    public void setTruckId(UUID truckId) {
        this.truckId = truckId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public BigDecimal getHeadingDegrees() {
        return headingDegrees;
    }

    public void setHeadingDegrees(BigDecimal headingDegrees) {
        this.headingDegrees = headingDegrees;
    }

    public BigDecimal getSpeedMps() {
        return speedMps;
    }

    public void setSpeedMps(BigDecimal speedMps) {
        this.speedMps = speedMps;
    }

    public BigDecimal getAccuracyMeters() {
        return accuracyMeters;
    }

    public void setAccuracyMeters(BigDecimal accuracyMeters) {
        this.accuracyMeters = accuracyMeters;
    }

    public Boolean getIsLive() {
        return isLive;
    }

    public void setIsLive(Boolean isLive) {
        this.isLive = isLive;
    }
}
