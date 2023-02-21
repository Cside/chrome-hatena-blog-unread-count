declare namespace chrome.action {
  export const setBadgeTextColor:
    | (({ color }: { color: string }) => Promise<void>)
    | undefined;
}
