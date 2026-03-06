package com.foodtruck.modules.truck.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.truck.api.dto.MenuItemRequest;
import com.foodtruck.modules.truck.api.dto.MenuItemResponse;
import com.foodtruck.modules.truck.domain.MenuItem;
import com.foodtruck.modules.truck.repository.MenuItemRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItemResponse> listAll() {
        return menuItemRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<MenuItemResponse> listByTruckId(UUID truckId) {
        return menuItemRepository.findByTruckId(truckId).stream().map(this::toResponse).toList();
    }

    public MenuItemResponse getById(UUID id) {
        MenuItem menuItem = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
        return toResponse(menuItem);
    }

    public MenuItemResponse create(MenuItemRequest request) {
        MenuItem menuItem = new MenuItem();
        menuItem.setId(UUID.randomUUID());
        apply(menuItem, request);
        return toResponse(menuItemRepository.save(menuItem));
    }

    public MenuItemResponse update(UUID id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
        apply(menuItem, request);
        return toResponse(menuItemRepository.save(menuItem));
    }

    public void delete(UUID id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item not found: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    private void apply(MenuItem menuItem, MenuItemRequest request) {
        menuItem.setTruckId(request.truckId());
        menuItem.setItemName(request.itemName().trim());
        menuItem.setDescription(request.description());
        menuItem.setCategory(request.category());
        menuItem.setImageUrl(request.imageUrl());
        menuItem.setPriceCents(request.priceCents());
        menuItem.setIsVegetarian(request.isVegetarian() != null ? request.isVegetarian() : false);
        menuItem.setIsVegan(request.isVegan() != null ? request.isVegan() : false);
        menuItem.setIsGlutenFree(request.isGlutenFree() != null ? request.isGlutenFree() : false);
        menuItem.setSpiceLevel(request.spiceLevel() != null ? request.spiceLevel() : (short) 0);
        menuItem.setPrepTimeMinutes(request.prepTimeMinutes());
        menuItem.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        menuItem.setIsAvailable(request.isAvailable() != null ? request.isAvailable() : true);
    }

    private MenuItemResponse toResponse(MenuItem menuItem) {
        return new MenuItemResponse(
            menuItem.getId(),
            menuItem.getTruckId(),
            menuItem.getItemName(),
            menuItem.getDescription(),
            menuItem.getCategory(),
            menuItem.getImageUrl(),
            menuItem.getPriceCents(),
            menuItem.getIsVegetarian(),
            menuItem.getIsVegan(),
            menuItem.getIsGlutenFree(),
            menuItem.getSpiceLevel(),
            menuItem.getPrepTimeMinutes(),
            menuItem.getSortOrder(),
            menuItem.getIsAvailable(),
            menuItem.getCreatedAt(),
            menuItem.getUpdatedAt()
        );
    }
}
