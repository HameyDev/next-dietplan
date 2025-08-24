export function buildEmptyWeek() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  return days.map(d => ({ day: d, meals: [] }));
}
