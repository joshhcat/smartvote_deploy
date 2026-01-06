function getLocalISODate(date) {
  // Get local date parts
  const year = date.geFull();
  // Month is 0-indexed, so add 1 and pad with '0' if needed
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  // Pad day with '0' if needed
  const day = date.getDate().toString().padStart(2, "0");

  // Combine into YYYY-MM-DD format
  return `${year}-${month}-${day}`;
}

export default getLocalISODate;
