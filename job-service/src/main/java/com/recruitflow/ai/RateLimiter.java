package com.recruitflow.ai;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

// Deliberately crude: a fixed cap per rolling minute, shared across all
// callers. An LLM call costs real money per request - this exists so a
// runaway frontend loop (or someone mashing the button) can't rack up an
// unbounded bill while this is still a side project. Replace with a proper
// per-user/IP limiter (e.g. Bucket4j + Redis) before this is multi-tenant.
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
            // New window - reset if we win the race, otherwise someone else already did.
            if (windowStart.compareAndSet(start, now)) {
                callsInWindow.set(0);
            }
        }

        return callsInWindow.incrementAndGet() <= MAX_CALLS_PER_MINUTE;
    }
}
