/**
 * Market Hours Utility
 * Check if US Stock Market is currently open
 * 
 * US Stock Market Hours (ET):
 * - Regular Trading: 9:30 AM - 4:00 PM ET
 * - Pre-market: 4:00 AM - 9:30 AM ET
 * - After-hours: 4:00 PM - 8:00 PM ET
 * 
 * Note: This doesn't account for holidays or early market closures
 */

/**
 * Check if US Stock Market is currently open (regular trading hours)
 * @returns true if market is open, false otherwise
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  
  // Convert to ET (Eastern Time)
  // ET is UTC-5 (EST) or UTC-4 (EDT)
  const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  const day = etTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Market is closed on weekends
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Regular trading hours: 9:30 AM - 4:00 PM ET
  const marketOpen = 9 * 60 + 30; // 9:30 AM = 570 minutes
  const marketClose = 16 * 60; // 4:00 PM = 960 minutes
  
  return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

/**
 * Get the latest trading date (most recent market close)
 * If market is currently open, returns today
 * If market is closed, returns the last trading day
 */
export function getLatestTradingDate(): Date {
  const now = new Date();
  const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const marketClose = 16 * 60; // 4:00 PM ET
  
  // If market is closed today (after 4 PM or weekend), use today
  // If market hasn't opened yet today, use yesterday
  if (day === 0) {
    // Sunday - use Friday
    const friday = new Date(etTime);
    friday.setDate(etTime.getDate() - 2);
    return friday;
  } else if (day === 6) {
    // Saturday - use Friday
    const friday = new Date(etTime);
    friday.setDate(etTime.getDate() - 1);
    return friday;
  } else if (timeInMinutes < marketClose) {
    // Before market close - use today
    return etTime;
  } else {
    // After market close - use today (market just closed)
    return etTime;
  }
}

