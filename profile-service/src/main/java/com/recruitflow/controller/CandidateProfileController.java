package com.recruitflow.controller;

import com.recruitflow.model.CandidateProfile;
import com.recruitflow.repository.CandidateProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles/candidates")
public class CandidateProfileController {
    private final CandidateProfileRepository repo;

    public CandidateProfileController(CandidateProfileRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<CandidateProfile> create(@RequestBody CandidateProfile profile) {
        return ResponseEntity.ok(repo.save(profile));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CandidateProfile> getByUser(@PathVariable Long userId) {
        return repo.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateProfile> update(@PathVariable Long id, @RequestBody CandidateProfile updated) {
        updated.setUserId(updated.getUserId());
        return repo.findById(id).map(existing -> {
            existing.setResumeUrl(updated.getResumeUrl());
            existing.setSkills(updated.getSkills());
            existing.setContactNumber(updated.getContactNumber());
            existing.setLocation(updated.getLocation());
            return ResponseEntity.ok(repo.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}