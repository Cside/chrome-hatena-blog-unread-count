import { selectOrOpenTab } from './utils';

const BASE_URL = 'https://blog.hatena.ne.jp';
const ANTENNA_URL = `${BASE_URL}/-/antenna`;
const API_URL = `${BASE_URL}/api/recent_subscribing`;
const BADGE_BACKGROUND_COLOR = '#c5100b';
const CHECK_INTERVAL = 15 * 60 * 1_000;

type ApiResponse = { count: number };

chrome.action.onClicked.addListener(async () => {
  await chrome.action.setBadgeText({ text: '' });
  await selectOrOpenTab({ url: ANTENNA_URL });
});

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.method === 'GET' && !details.fromCache)
      await chrome.action.setBadgeText({ text: '' });
  },
  { urls: [`${ANTENNA_URL}*`] },
);

const checkUpdate = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) {
      throw new Error(
        `Failed to request API. status: ${
          res.status
        }, body: ${await res.text()}`,
      );
    }
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
  setInterval(checkUpdate, CHECK_INTERVAL);
  await checkUpdate();
})();
