import logger from "./logger/browserLogger";

function deleteIndexedDB(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      logger.warn("Delete blocked for database", name);
    };
  });
}

export const clearAllBrowserData = async () => {
  const clearOperations = [];

  // LocalStorage
  clearOperations.push(Promise.resolve(localStorage.clear()));

  // SessionStorage
  clearOperations.push(Promise.resolve(sessionStorage.clear()));

  // Cookies
  clearOperations.push(
    new Promise<void>((resolve) => {
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname.split(".").slice(-2).join(".")}`;
      });
      resolve();
    })
  );

  // IndexedDB
  if ("indexedDB" in window) {
    clearOperations.push(
      indexedDB
        .databases()
        .then((databases) =>
          Promise.all(
            databases.map((db) =>
              db.name ? deleteIndexedDB(db.name) : Promise.resolve()
            )
          )
        )
        .catch(() => {
          const dbNames = ["amplify-datastore", "aws-amplify-cachestorage"];
          return Promise.all(
            dbNames.map((name) => deleteIndexedDB(name).catch(() => {}))
          );
        })
    );
  }

  // Cache Storage
  if ("caches" in window) {
    clearOperations.push(
      caches
        .keys()
        .then((names) => Promise.all(names.map((name) => caches.delete(name))))
        .catch(() => {})
    );
  }

  // Service Workers
  if ("serviceWorker" in navigator) {
    clearOperations.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((reg) => reg.unregister()))
        )
        .catch(() => {})
    );
  }

  await Promise.allSettled(clearOperations);
};
