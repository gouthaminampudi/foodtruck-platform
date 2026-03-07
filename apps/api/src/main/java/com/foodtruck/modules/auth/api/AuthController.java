package com.foodtruck.modules.auth.api;

import com.foodtruck.modules.auth.api.dto.AuthResponse;
import com.foodtruck.modules.auth.api.dto.CustomerSignUpRequest;
import com.foodtruck.modules.auth.api.dto.OperatorSignUpRequest;
import com.foodtruck.modules.auth.api.dto.SignInRequest;
import com.foodtruck.modules.auth.service.AuthService;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.operator.api.dto.OperatorProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/customer/signup")
    public ResponseEntity<CustomerResponse> customerSignUp(@Valid @RequestBody CustomerSignUpRequest request) {
        return ResponseEntity.ok(authService.customerSignUp(request));
    }

    @PostMapping("/customer/signin")
    public ResponseEntity<AuthResponse> customerSignIn(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authService.customerSignIn(request));
    }

    @PostMapping("/admin/signin")
    public ResponseEntity<AuthResponse> adminSignIn(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authService.adminSignIn(request));
    }

    @PostMapping("/operator/signup")
    public ResponseEntity<OperatorProfileResponse> operatorSignUp(@Valid @RequestBody OperatorSignUpRequest request) {
        return ResponseEntity.ok(authService.operatorSignUp(request));
    }

    @PostMapping("/operator/signin")
    public ResponseEntity<AuthResponse> operatorSignIn(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authService.operatorSignIn(request));
    }
}
