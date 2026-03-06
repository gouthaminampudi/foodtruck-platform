package com.foodtruck.modules.truck.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.truck.api.dto.TruckOperatorAssignmentRequest;
import com.foodtruck.modules.truck.api.dto.TruckOperatorAssignmentResponse;
import com.foodtruck.modules.truck.domain.TruckOperatorAssignment;
import com.foodtruck.modules.truck.repository.TruckOperatorAssignmentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TruckOperatorAssignmentService {

    private final TruckOperatorAssignmentRepository truckOperatorAssignmentRepository;

    public TruckOperatorAssignmentService(TruckOperatorAssignmentRepository truckOperatorAssignmentRepository) {
        this.truckOperatorAssignmentRepository = truckOperatorAssignmentRepository;
    }

    public List<TruckOperatorAssignmentResponse> listByTruckId(UUID truckId) {
        return truckOperatorAssignmentRepository.findByTruckId(truckId).stream().map(this::toResponse).toList();
    }

    public TruckOperatorAssignmentResponse getById(UUID id) {
        TruckOperatorAssignment assignment = truckOperatorAssignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Truck operator assignment not found: " + id));
        return toResponse(assignment);
    }

    public TruckOperatorAssignmentResponse create(TruckOperatorAssignmentRequest request) {
        TruckOperatorAssignment assignment = truckOperatorAssignmentRepository
            .findByTruckIdAndUserId(request.truckId(), request.userId())
            .orElseGet(TruckOperatorAssignment::new);
        if (assignment.getId() == null) {
            assignment.setId(UUID.randomUUID());
        }
        apply(assignment, request);
        return toResponse(truckOperatorAssignmentRepository.save(assignment));
    }

    public TruckOperatorAssignmentResponse update(UUID id, TruckOperatorAssignmentRequest request) {
        TruckOperatorAssignment assignment = truckOperatorAssignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Truck operator assignment not found: " + id));
        apply(assignment, request);
        return toResponse(truckOperatorAssignmentRepository.save(assignment));
    }

    public void delete(UUID id) {
        if (!truckOperatorAssignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Truck operator assignment not found: " + id);
        }
        truckOperatorAssignmentRepository.deleteById(id);
    }

    private void apply(TruckOperatorAssignment assignment, TruckOperatorAssignmentRequest request) {
        assignment.setTruckId(request.truckId());
        assignment.setUserId(request.userId());
        assignment.setOperatorRole(request.operatorRole());
        assignment.setIsActive(request.isActive() != null ? request.isActive() : true);
    }

    private TruckOperatorAssignmentResponse toResponse(TruckOperatorAssignment assignment) {
        return new TruckOperatorAssignmentResponse(
            assignment.getId(),
            assignment.getTruckId(),
            assignment.getUserId(),
            assignment.getOperatorRole(),
            assignment.getIsActive(),
            assignment.getCreatedAt(),
            assignment.getUpdatedAt()
        );
    }
}
