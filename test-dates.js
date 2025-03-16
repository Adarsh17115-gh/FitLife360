// Test the date calculation
function getWeekDates() {
  const today = new Date();
  console.log("Original today:", today);
  
  const day = today.getDay(); // 0 is Sunday, 6 is Saturday
  console.log("Day of week:", day);
  
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when today is Sunday
  console.log("Date diff calculation:", diff);
  
  // Create a new date object for Monday rather than modifying the original today date
  const monday = new Date(today);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  console.log("Monday date:", monday);
  
  // The issue is likely here - we need to add i to the monday's date, not to the 
  // continuously changing monday object
  const weekDates = [];
  const mondayDate = monday.getDate();
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(mondayDate + i);  // Use mondayDate (a number) instead of monday.getDate()
    weekDates.push(date);
  }
  
  console.log("Week dates:");
  weekDates.forEach((date, i) => {
    console.log(`Day ${i+1}:`, date);
  });
  
  return weekDates;
}

getWeekDates();