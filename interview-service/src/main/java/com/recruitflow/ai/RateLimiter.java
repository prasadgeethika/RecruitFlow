package com.recruitflow.ai;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

// Same guardrail as job-service's AI feature: a fixed cap per rolling
// minute, shared across all callers, so a runaway loop or button-mashing
// can't blow through Gemini's free-tier daily quota unnoticed.
@Component
public class RateLimiter {
    private static final int MAX_CALLS_PER_MINUTE = 10;
    private static final long WINDOW_MILLIS = 60_000;

    private final AtomicInteger callsInWindow = new AtomicInteger(0);
    private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());

    public boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long start = windowStart.get();

        if (now - start > WINDOW_MILLIS) {
            if (windowStart.compareAndSet(start, now)) {
                callsInWindow.set(0);
            }
        }

        return callsInWindow.incrementAndGet() <= MAX_CALLS_PER_MINUTE;
    }
}
