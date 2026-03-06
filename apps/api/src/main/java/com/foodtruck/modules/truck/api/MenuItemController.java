package com.foodtruck.modules.truck.api;

import com.foodtruck.modules.truck.api.dto.MenuItemRequest;
import com.foodtruck.modules.truck.api.dto.MenuItemResponse;
import com.foodtruck.modules.truck.service.MenuItemService;
import com.foodtruck.modules.truck.service.TruckActionPermission;
import com.foodtruck.modules.truck.service.TruckAuthorizationService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final TruckAuthorizationService truckAuthorizationService;

    public MenuItemController(
        MenuItemService menuItemService,
        TruckAuthorizationService truckAuthorizationService
    ) {
        this.menuItemService = menuItemService;
        this.truckAuthorizationService = truckAuthorizationService;
    }

    @GetMapping
    public List<MenuItemResponse> list(@RequestParam(required = false) UUID truckId) {
        if (truckId != null) {
            return menuItemService.listByTruckId(truckId);
        }
        return menuItemService.listAll();
    }

    @GetMapping("/{id}")
    public MenuItemResponse getById(@PathVariable UUID id) {
        return menuItemService.getById(id);
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> create(
        @Valid @RequestBody MenuItemRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(request.truckId(), actorUserId, TruckActionPermission.MENU_MANAGE);
        MenuItemResponse created = menuItemService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/menu-items/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(
        @PathVariable UUID id,
        @Valid @RequestBody MenuItemRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(request.truckId(), actorUserId, TruckActionPermission.MENU_MANAGE);
        return menuItemService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        MenuItemResponse existing = menuItemService.getById(id);
        truckAuthorizationService.authorize(existing.truckId(), actorUserId, TruckActionPermission.MENU_MANAGE);
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
