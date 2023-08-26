const BADGE_TEXT_COLOR = '#ffffff';
const BADGE_BACKGROUND_COLOR = '#c5100b';

await chrome.action.setBadgeBackgroundColor({
  color: BADGE_BACKGROUND_COLOR,
});
await chrome.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });

export {};
