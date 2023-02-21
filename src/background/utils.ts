import { isNonEmpty } from 'ts-array-length';

export const selectOrOpenTab = async ({ url }: { url: string }) => {
  const tabs = await chrome.tabs.query({ url: `${url}*` });
  if (isNonEmpty(tabs)) {
    const tab = tabs[0];
    await chrome.windows.update(tab.windowId ?? 0, { focused: true });
    await chrome.tabs.update(tab.id ?? 0, { active: true });
    await chrome.tabs.reload(tab.id ?? 0);
    return;
  }
  await chrome.tabs.create({ url });
};
