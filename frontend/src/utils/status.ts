// Shared status → display treatment for JobApplication statuses, so every
// page (Applications, Review Applications) renders them identically instead
// of each page inventing its own text/casing.
const LABELS: Record<string, string> = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    SELECTED: "Selected",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
    HIRED: "Hired",
};

export function statusLabel(status: string): string {
    return LABELS[status] ?? status;
}

export function statusPillClass(status: string): string {
    return `status-pill status-pill--${status.toLowerCase()}`;
}
