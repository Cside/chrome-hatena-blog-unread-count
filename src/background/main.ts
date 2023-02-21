const BASE_URL = 'https://blog.hatena.ne.jp';
const ANTENNA_URL = `${BASE_URL}/-/antenna`;
const API_URL = `${BASE_URL}/api/recent_subscribing`;
const BADGE_BACKGROUND_COLOR = '#c5100b';
const CHECK_INTERVAL = 15 * 60 * 1_000;

chrome.action.onClicked.addListener(async () => {
  await chrome.action.setBadgeText({ text: '' });
  await chrome.tabs.create({ url: ANTENNA_URL });
});

const checkUpdate = async () => {
  const res: { count: number } = await fetch(API_URL, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  }).then((res) => res.json());

  await chrome.action.setBadgeText({
    text: res.count > 0 ? String(res.count) : '',
  });
};

(async () => {
  await chrome.action.setBadgeBackgroundColor({
    color: BADGE_BACKGROUND_COLOR,
  });
  setInterval(checkUpdate, CHECK_INTERVAL);
  await checkUpdate();
})();
