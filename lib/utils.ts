export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "mild":
      return "severity-mild";
    case "moderate":
      return "severity-moderate";
    case "severe":
      return "severity-severe";
    case "critical":
      return "severity-critical";
    default:
      return "severity-mild";
  }
}

export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case "mild":
      return "🟢 Mild";
    case "moderate":
      return "🟡 Moderate";
    case "severe":
      return "🔴 Severe";
    case "critical":
      return "🚨 CRITICAL";
    default:
      return "🟢 Mild";
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
