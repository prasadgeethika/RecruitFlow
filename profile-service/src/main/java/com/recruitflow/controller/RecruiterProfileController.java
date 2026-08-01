package com.recruitflow.controller;

import com.recruitflow.model.RecruiterProfile;
import com.recruitflow.repository.RecruiterProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles/recruiters")
public class RecruiterProfileController {

    private final RecruiterProfileRepository repo;

    public RecruiterProfileController(RecruiterProfileRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<RecruiterProfile> create(@RequestBody RecruiterProfile profile) {
        return ResponseEntity.ok(repo.save(profile));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<RecruiterProfile> getByUser(@PathVariable Long userId) {
        return repo.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecruiterProfile> update(@PathVariable Long id,
                                                   @RequestBody RecruiterProfile updated) {

        return repo.findById(id).map(existing -> {
            existing.setDepartment(updated.getDepartment());
            existing.setDesignation(updated.getDesignation());
            existing.setCompany(updated.getCompany());

            return ResponseEntity.ok(repo.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}