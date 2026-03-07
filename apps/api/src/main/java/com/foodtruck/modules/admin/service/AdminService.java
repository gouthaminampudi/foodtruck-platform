package com.foodtruck.modules.admin.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.admin.api.dto.AdminCustomerUpdateRequest;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.customer.service.CustomerService;
import com.foodtruck.modules.truck.api.dto.TruckProfileRequest;
import com.foodtruck.modules.truck.api.dto.TruckProfileResponse;
import com.foodtruck.modules.truck.repository.TruckProfileRepository;
import com.foodtruck.modules.truck.service.TruckProfileService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final CustomerService customerService;
    private final TruckProfileService truckProfileService;
    private final TruckProfileRepository truckProfileRepository;

    public AdminService(
        CustomerService customerService,
        TruckProfileService truckProfileService,
        TruckProfileRepository truckProfileRepository
    ) {
        this.customerService = customerService;
        this.truckProfileService = truckProfileService;
        this.truckProfileRepository = truckProfileRepository;
    }

    public List<CustomerResponse> listCustomers(String query) {
        return customerService.listForAdmin(query);
    }

    public CustomerResponse getCustomer(UUID userId) {
        return customerService.getByUserId(userId);
    }

    public CustomerResponse updateCustomer(UUID userId, AdminCustomerUpdateRequest request) {
        return customerService.updateByAdmin(userId, request);
    }

    public CustomerResponse activateCustomer(UUID userId) {
        return customerService.setActive(userId, true);
    }

    public CustomerResponse deactivateCustomer(UUID userId) {
        return customerService.setActive(userId, false);
    }

    public List<TruckProfileResponse> listTrucks() {
        return truckProfileService.listAll();
    }

    public TruckProfileResponse getTruck(UUID truckId) {
        return truckProfileService.getById(truckId);
    }

    public TruckProfileResponse createTruck(TruckProfileRequest request) {
        return truckProfileService.create(request);
    }

    public TruckProfileResponse updateTruck(UUID truckId, TruckProfileRequest request) {
        return truckProfileService.update(truckId, request);
    }

    @Transactional
    public TruckProfileResponse activateTruck(UUID truckId) {
        var truck = truckProfileRepository.findById(truckId)
            .orElseThrow(() -> new ResourceNotFoundException("Truck profile not found: " + truckId));
        truck.setIsActive(true);
        return truckProfileService.getById(truckProfileRepository.save(truck).getId());
    }

    @Transactional
    public TruckProfileResponse deactivateTruck(UUID truckId) {
        var truck = truckProfileRepository.findById(truckId)
            .orElseThrow(() -> new ResourceNotFoundException("Truck profile not found: " + truckId));
        truck.setIsActive(false);
        truck.setIsOnline(false);
        return truckProfileService.getById(truckProfileRepository.save(truck).getId());
    }
}
