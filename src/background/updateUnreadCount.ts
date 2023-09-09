import manifest from '../../manifest.json';

const ALARM_NAME = 'update-unread-count';
const API_URL = manifest.host_permissions[0];
if (!API_URL) throw new Error(`manifest.host_permissions[0] is not defined`);
const INTERVAL_MINUTES = 15;

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case ALARM_NAME: {
      const now = new Date(alarm.scheduledTime);
      console.info(`Start update at: ${now.toLocaleTimeString()}`);
      try {
        // TODO retry...は今はしない
        const res = await fetch(API_URL, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        if (!res.ok)
          throw new Error(
            `Failed to request API. status: ${res.status}, body: ${await res.text()}`,
          );
        const resObject: { count: number } = await res.json();
        console.info(`  response: ${JSON.stringify(resObject)}`);

        await chrome.action.setBadgeText({
          text: resObject.count > 0 ? String(resObject.count) : '',
        });
      } catch (error) {
        console.error(`Failed to fetch. ${error}`);
      }
      const next = new Date(now.getTime());
      next.setMinutes(now.getMinutes() + INTERVAL_MINUTES);
      console.info(`Next Scheduled at: ${next.toLocaleTimeString()}`);
      break;
    }
    default:
      throw new Error(`Unknown alarm: ${alarm.name}`);
  }
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) return;

  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 0,
    periodInMinutes: INTERVAL_MINUTES,
  });
  console.info(`Alarm is created at: ${new Date().toLocaleTimeString()}`);
});
