export const selectOrOpenTab = async ({ url }: { url: string }) => {
  const tabs = await chrome.tabs.query({ url: `${url}*` });
  if (tabs.length >= 1) {
    await chrome.windows.update(tabs[0].windowId ?? 0, { focused: true });
    await chrome.tabs.update(tabs[0].id ?? 0, { active: true });
    return;
  }
  await chrome.tabs.create({ url });
};
