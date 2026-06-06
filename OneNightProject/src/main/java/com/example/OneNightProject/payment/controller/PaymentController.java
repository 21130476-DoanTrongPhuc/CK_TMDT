package com.example.OneNightProject.payment.controller;

import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.payment.dto.PaymentDTO;
import com.example.OneNightProject.payment.dto.PaymentRequest;
import com.example.OneNightProject.payment.dto.PaymentResponse;
import com.example.OneNightProject.payment.response.ResponseObject;
import com.example.OneNightProject.payment.service.PaymentService;
import com.example.OneNightProject.payment.service.impl.PaymentServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {
    @Autowired
    private final PaymentServiceImpl paymentService;
    @Autowired
    private final OrderRepository orderRepository;
//    private final PaymentService payment;
    @PostMapping()
    public ResponseEntity<PaymentResponse> createPayment(HttpServletRequest request, @RequestBody PaymentRequest payment){
        return ResponseEntity.ok(paymentService.createPayment(request, payment));
    }
    @GetMapping("/{orderId}/customized")
    public ResponseEntity<Boolean> isCustomized(
            @PathVariable Long orderId
    ){
        return ResponseEntity.ok(
                orderRepository.isOrderCustomized(orderId)
        );
    }
    @PostMapping("/get")
    public ResponseEntity<PaymentResponse> getPayment(@RequestBody PaymentRequest payment){
        return ResponseEntity.ok(paymentService.getPayment(payment));
    }
    @PostMapping("/cod/{orderId}")
    public ResponseEntity<?> confirmCOD(
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(
                paymentService.confirmCOD(orderId)
        );
    }
    @GetMapping("/vn-pay")
    public ResponseObject<PaymentDTO.VNPayResponse> pay(HttpServletRequest request) {
        return new ResponseObject<>(HttpStatus.OK, "Success", paymentService.createVnPayPayment(request));
    }
    @GetMapping("/vn-pay-callback")
    public void payCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        paymentService.callBackHandler(request, response);
    }
}
