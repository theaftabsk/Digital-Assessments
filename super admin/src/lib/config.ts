export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:4000";
    }
    if (window.location.hostname.includes("greatcampus.tech")) {
      return "https://api.assessment.greatcampus.tech";
    }
    return "https://api.assessment.greatcampus.in";
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.assessment.greatcampus.tech"
  );
}
