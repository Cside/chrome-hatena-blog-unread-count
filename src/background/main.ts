import manifest from '../../manifest.json';
import { selectOrOpenTab } from './utils';

const BASE_URL = 'https://blog.hatena.ne.jp';
const ANTENNA_PATH = '/-/antenna';
const ANTENNA_URL = `${BASE_URL}${ANTENNA_PATH}`;
const API_URL = manifest.host_permissions[0];
if (!API_URL) throw new Error(`manifest.host_permissions[0] is not defined`);

const BADGE_TEXT_COLOR = '#ffffff';
const BADGE_BACKGROUND_COLOR = '#c5100b';
const UPDATE_INTERVAL_MINUTES = 15;

type ApiResponse = { count: number };

chrome.action.onClicked.addListener(async () => {
  await chrome.action.setBadgeText({ text: '' });
  await selectOrOpenTab({ url: ANTENNA_URL });
});

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (
      details.method === 'GET' &&
      // このチェックが無いと、/-/antenna_foo みたいなパスでも実行されてしまう
      new URL(details.url).pathname === ANTENNA_PATH
    )
      await chrome.action.setBadgeText({ text: '' });
  },
  { urls: [`${ANTENNA_URL}*`] },
);

// update unread count
const ALARM_NAME = 'update-unread-count';

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case ALARM_NAME:
      console.info(`Start update at: ${new Date().toLocaleTimeString()}`);
      try {
        const res = await fetch(API_URL, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        if (!res.ok)
          throw new Error(
            `Failed to request API. status: ${
              res.status
            }, body: ${await res.text()}`,
          );
        const resObject: ApiResponse = await res.json();
        console.info(`  response: ${JSON.stringify(resObject)}`);

        await chrome.action.setBadgeText({
          text: resObject.count > 0 ? String(resObject.count) : '',
        });
      } catch (error) {
        console.error(`Failed to fetch. ${error}`);
      }
      break;

    default:
      throw new Error(`Unknown alarm: ${alarm.name}`);
  }
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) return;

  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 0,
    periodInMinutes: UPDATE_INTERVAL_MINUTES,
  });
  console.info(`Alarm is created at: ${new Date().toLocaleTimeString()}`);
});

await chrome.action.setBadgeBackgroundColor({
  color: BADGE_BACKGROUND_COLOR,
});
await chrome.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });
