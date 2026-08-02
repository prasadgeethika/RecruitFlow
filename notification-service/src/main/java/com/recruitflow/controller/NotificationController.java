package com.recruitflow.controller;

import com.recruitflow.dto.CreateNotificationRequest;
import com.recruitflow.model.Notification;
import com.recruitflow.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository repo;

    public NotificationController(NotificationRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody CreateNotificationRequest req) {
        Notification n = new Notification();
        n.setUserId(req.userId());
        n.setMessage(req.message());
        return ResponseEntity.ok(repo.save(n));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> listByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(repo.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable Long id) {
        Notification n = repo.findById(id).orElseThrow(() -> new IllegalStateException("Not found"));
        n.setRead(true);
        return ResponseEntity.ok(repo.save(n));
    }
}