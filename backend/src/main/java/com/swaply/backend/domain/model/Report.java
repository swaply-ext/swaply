package com.swaply.backend.domain.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;


@Container(containerName = "swaply")
public class Report {
    
    @Id
    private String reportId;
    private Report type;
    private String reporterUserId;
    private String reportedUserId;
    private String reportedEventId;
    private String reason;
    private LocalDateTime createdAt;

   
   /*
    public Report() {
    }

    public Report(String reportId, Report type, String reporterUserId, String reportedUserId, String reportedEventId, String reason, LocalDateTime createdAt) {

        this.reportId = reportId;
        this.type = type;
        this.reporterUserId = reporterUserId;
        this.reportedUserId = reportedUserId;
        this.reportedEventId = reportedEventId;
        this.reason = reason;
        this.createdAt = createdAt;

    }
    */

    // Getters and setters
    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public Report getType() {
        return type;
    }

    public void setType(Report type) {
        this.type = type;
    }

    public String getReporterUserId() {
        return reporterUserId;
    }

    public void setReporterUserId(String reporterUserId) {
        this.reporterUserId = reporterUserId;
    }

    public String getReportedUserId() {
        return reportedUserId;
    }

    public void setReportedUserId(String reportedUserId) {
        this.reportedUserId = reportedUserId;
    }

    public String getReportedEventId() {
        return reportedEventId;
    }

    public void setReportedEventId(String reportedEventId) {
        this.reportedEventId = reportedEventId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
