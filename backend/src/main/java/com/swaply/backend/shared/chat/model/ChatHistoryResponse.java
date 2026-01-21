package com.swaply.backend.shared.chat.model; // Ajusta el paquete

import com.swaply.backend.shared.chat.model.ChatMessage;
import java.util.List;

public class ChatHistoryResponse {
    private List<ChatMessage> messages;
    private String continuationToken;

    public ChatHistoryResponse(List<ChatMessage> messages, String continuationToken) {
        this.messages = messages;
        this.continuationToken = continuationToken;
    }

    // Getters y Setters
    public List<ChatMessage> getMessages() { return messages; }
    public String getContinuationToken() { return continuationToken; }
}