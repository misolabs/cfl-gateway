/**
 * Manual smoke check against the live mobiliteit.lu API.
 *
 * Requires `MOBILITEIT_ACCESS_ID` (see `.env.example`). Run with:
 *   npm run smoke
 */
import { CflInfoService } from '../src/service.js';

const from = Number(process.argv[2] ?? 300031019); // Luxembourg, Gare Centrale
const to = Number(process.argv[3] ?? 300439001); // Esch-sur-Alzette, Gare
const max = Number(process.argv[4] ?? 5);

const service = new CflInfoService();
const schedule = await service.getSchedule(from, to, max);

console.log(JSON.stringify(schedule, null, 2));

if (schedule.trains.length === 0) {
  console.error('\n⚠️  No trains returned - check the station ids or the time of day.');
  process.exit(1);
}
console.log(`\n✅ ${schedule.trains.length} train(s) to ${schedule.destination}`);

