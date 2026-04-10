export function formatPersonName(name: string, partnerName?: string): string {
  if (!partnerName) return name;
  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";
  const partnerFirstName = partnerName.trim().split(" ")[0];
  if (lastName) return `${firstName} & ${partnerFirstName} ${lastName}`;
  return `${firstName} & ${partnerFirstName}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${dayName}, ${monthName} ${dayOfMonth}, ${year} at ${displayHours}:${displayMinutes} ${ampm}`;
}
