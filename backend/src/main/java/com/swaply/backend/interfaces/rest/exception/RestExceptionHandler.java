package com.swaply.backend.interfaces.rest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.swaply.backend.application.exception.UserNotFoundException;

@ControllerAdvice 
public class RestExceptionHandler {

    // Errores si no existe un usuario (ha fallado con exito)
    @ExceptionHandler(UserNotFoundException.class) 
    public ResponseEntity<String> handleNotFound(UserNotFoundException ex) {
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    // Errores inesperados
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericError(Exception ex) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado.");
    }
}