export const formatRunway = (months: number): string => {
  if (months < 12) {
    return `${months.toFixed(0)} months`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths > 0) {
    return `${years} year${years > 1 ? "s" : ""} ${remainingMonths.toFixed(0)} month${remainingMonths > 1 ? "s" : ""}`;
  }

  return `${years} year${years > 1 ? "s" : ""}`;
};
