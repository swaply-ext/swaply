package com.swaply.backend.application.payment.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.swaply.backend.shared.UserCRUD.UserRepository;
import com.swaply.backend.shared.UserCRUD.UserService;
import com.swaply.backend.shared.UserCRUD.Model.User;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.key}")
    private String stripeKey;

    private final UserService userService;
    private final UserRepository userRepository;

    //esto es para crear la sesión y vincularla al ID del usuario
    public String createPremiumCheckoutSession(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        if (user.isPremium()) {
            throw new IllegalStateException("El usuario ya es Premium. No se puede procesar un nuevo pago.");
        }
        Stripe.apiKey = stripeKey;
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                //si va bien redirige a home con el id de la sesión
                .setSuccessUrl("http://localhost:4200/home?session_id={CHECKOUT_SESSION_ID}")
                //redirige a la landing si se cancela el pago 
                .setCancelUrl("http://localhost:4200/landing")
                //se vincula la sesión al ID del usuario 
                .setClientReferenceId(userId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount(500L) // el precio, es decir 5 euros
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Suscripción Premium Swaply")
                                        .build())
                                .build())
                        .build())
                .build();

        try {
            Session session = Session.create(params);
            return session.getUrl();
        } catch (Exception e) {
            throw new RuntimeException("Error al crear sesión de Stripe", e);
        }
    }

    //este metodo es para confirmar el pago y activar el premium
    public void confirmPremiumPayment(String sessionId, String currentUserId) {
        Stripe.apiKey = stripeKey;

        try {
            //recupera la sesión de Stripe
            Session session = Session.retrieve(sessionId);

            //verifica que el pago está completado
            if (!"paid".equals(session.getPaymentStatus())) {
                throw new RuntimeException("El pago no se ha completado o es inválido.");
            }

            //verifica que el usuario que paga es el mismo que inició la sesión
            if (!currentUserId.equals(session.getClientReferenceId())) {
                throw new SecurityException("Intento de fraude: La sesión de pago no pertenece a este usuario.");
            }

            //si todo va bien, se activa el premium
            userService.activatePremium(currentUserId);

        } catch (Exception e) {
            throw new RuntimeException("Error verificando el pago: " + e.getMessage());
        }
    }
}