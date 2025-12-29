package com.swaply.backend.shared;

import com.swaply.backend.application.auth.exception.SwapNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.swaply.backend.application.auth.exception.InvalidCredentialsException;
import com.swaply.backend.application.auth.exception.NewPasswordMatchesOldException;
import com.swaply.backend.application.auth.exception.UserAlreadyExistsException;
import com.swaply.backend.shared.UserCRUD.exception.UserNotFoundException;
import com.swaply.backend.shared.chat.exception.RoomNotFoundException;
import com.swaply.backend.shared.chat.exception.UserNotInThisRoomException;

@ControllerAdvice
public class RestExceptionHandler {

    // Errores si no existe un usuario (ha fallado con exito)
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleNotFound(UserNotFoundException e) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(SwapNotFoundException.class)
    public ResponseEntity<String> handleSwapNotFound(SwapNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<String> handleUserAlreadyExists(UserAlreadyExistsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<String> handleInvalidCredentials(InvalidCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    // Errores inesperados
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericError(Exception e) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado: " + e.getMessage());
    }

    @ExceptionHandler(NewPasswordMatchesOldException.class)
    public ResponseEntity<String> handleNewPasswordMatchesOld(NewPasswordMatchesOldException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(UserNotInThisRoomException.class)
    public ResponseEntity<String> handdleUserNotExistsInThisRoom(InvalidCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<String> handleRoomNotExists(UserNotFoundException e) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    

}