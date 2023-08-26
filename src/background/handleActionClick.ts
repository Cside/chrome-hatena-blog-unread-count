import { selectOrOpenTab } from './utils';

const BASE_URL = 'https://blog.hatena.ne.jp';
const ANTENNA_PATH = '/-/antenna';
const ANTENNA_URL = `${BASE_URL}${ANTENNA_PATH}`;

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
