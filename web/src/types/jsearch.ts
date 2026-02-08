export type JSearchJob = {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo?: string;
    job_city: string;
    job_state?: string;
    job_country: string;
    job_is_remote: boolean;
    job_description: string;
    job_apply_link: string;
    job_posted_at_timestamp: number;
    // Add other fields as needed from JSearch response if necessary
};

export type JSearchResponse = {
    status: string;
    request_id: string;
    data: JSearchJob[];
};

export type JobCard = {
    id: string;
    title: string;
    company: string;
    location: string;
    remote: boolean;
    descriptionSnippet: string;
    url: string;
    postedAt: string; // Formatted date or timestamp
    source: "jsearch";
    logo?: string;
};
