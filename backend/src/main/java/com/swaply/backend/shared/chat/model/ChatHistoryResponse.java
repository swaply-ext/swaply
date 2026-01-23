package com.swaply.backend.shared.chat.model; 

import com.swaply.backend.shared.chat.model.ChatMessage;
import java.util.List;

public class ChatHistoryResponse {
    private List<ChatMessage> messages;
    private String continuationToken;

    public ChatHistoryResponse(List<ChatMessage> messages, String continuationToken) {
        this.messages = messages;
        this.continuationToken = continuationToken;
    }

    public List<ChatMessage> getMessages() { return messages; }
    public String getContinuationToken() { return continuationToken; }
}