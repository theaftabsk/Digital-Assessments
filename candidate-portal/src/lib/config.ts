export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_API_URL || "https://api.assessment.greatcampus.tech";
    }
    if (window.location.hostname.includes("greatcampus.tech")) {
      return "https://api.assessment.greatcampus.tech";
    }
    if (window.location.hostname.includes("greatcampus.in")) {
      return "https://api.assessment.greatcampus.in";
    }
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.assessment.greatcampus.tech"
  );
};
