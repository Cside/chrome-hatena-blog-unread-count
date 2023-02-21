import manifest from '../../manifest.json';
import { selectOrOpenTab } from './utils';

const BASE_URL = 'https://blog.hatena.ne.jp';
const ANTENNA_PATH = '/-/antenna';
const ANTENNA_URL = `${BASE_URL}${ANTENNA_PATH}`;
const API_URL = manifest.host_permissions[0];
if (!API_URL) throw new Error(`manifest.host_permissions[0] is not defined`);

const BADGE_TEXT_COLOR = '#ffffff';
const BADGE_BACKGROUND_COLOR = '#c5100b';
const CHECK_INTERVAL = 20 * 60 * 1000;

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

const updateUnreadCount = async () => {
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
    await chrome.action.setBadgeText({
      text: resObject.count > 0 ? String(resObject.count) : '',
    });
  } catch (error) {
    console.error(`Failed to fetch. ${error}`);
  }
};

(async () => {
  await chrome.action.setBadgeBackgroundColor({
    color: BADGE_BACKGROUND_COLOR,
  });
  // Chrome 110+
  // https://developer.chrome.com/docs/extensions/reference/action/#method-setBadgeTextColor
  if (chrome.action.setBadgeTextColor)
    await chrome.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });

  setInterval(updateUnreadCount, CHECK_INTERVAL);
  await updateUnreadCount();
})();
