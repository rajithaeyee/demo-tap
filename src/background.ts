const CONTENT_FILES = ["shared.js", "content.js"];

function isInjectableUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /^(https?|file|ftp):/i.test(url);
}

async function injectIntoAllTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id === undefined || !isInjectableUrl(tab.url)) return;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: CONTENT_FILES,
        });
      } catch {
        console.warn("Some pages eg-web store, pdfs in some configs cant be injected.")
      }
    }),
  );
}

chrome.runtime.onInstalled.addListener(() => {
  void injectIntoAllTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void injectIntoAllTabs();
});
