async function init() {

  const registration = await navigator.serviceWorker.register('https://github.com/sheikabdullasha/Push_Note-javascriptt/blob/main/sw.js')

  console.log("waiting for service worker connection");
  console.log("reg :",registration);

  await navigator.serviceWorker.ready;
  console.log("got service worker connection");
  console.log("--------------------------->");
  firebase.initializeApp({
    apiKey: "AIzaSyD2FfzNaEaAE33UX_tk-ELKvOGLAhWD3iI",
    authDomain: "pushnot-test-f4efc.firebaseapp.com",
    projectId: "pushnot-test-f4efc",
    storageBucket: "pushnot-test-f4efc.appspot.com",
    messagingSenderId: "33155745540",
    appId: "1:33155745540:web:db92c4fb94ace689893251",
    measurementId: "G-8K005ZR53L"
  });
  const messaging = firebase.messaging();
  messaging.usePublicVapidKey('BJmYY2uJbGltwWtfelO6PiV9tBCdSZMf6xUiTKx1lpvH4x7YdyhVkCX2Xq1pDqEESuWAC_MbAnjuYEFYgJML_3M');
  messaging.useServiceWorker(registration);
  console.log("--------------------------->");
  console.log("tok : ",messaging.getToken({vapidKey: "BJmYY2uJbGltwWtfelO6PiV9tBCdSZMf6xUiTKx1lpvH4x7YdyhVkCX2Xq1pDqEESuWAC_MbAnjuYEFYgJML_3M"}));

  try {
    await messaging.requestPermission();
  } catch (e) {
    console.log('Unable to get permission', e);
    return;
  }

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'newData') {
      showData();
    }
  });

  const currentToken = await messaging.getToken();
  console.log("token is : ",currentToken);
  fetch('/register', { method: 'post', body: currentToken });
  showData();

  messaging.onTokenRefresh(async () => {
    console.log('token refreshed');
    const newToken = await messaging.getToken();
    fetch('/register', { method: 'post', body: currentToken });
  });

}

async function showData() {
  const db = await getDb();
  const tx = db.transaction('jokes', 'readonly');
  const store = tx.objectStore('jokes');
  store.getAll().onsuccess = e => showJokes(e.target.result);
}

function showJokes(jokes) {
  const table = document.getElementById('outTable');

  jokes.sort((a, b) => parseInt(b.ts) - parseInt(a.ts));
  const html = [];
  jokes.forEach(j => {
    const date = new Date(parseInt(j.ts));
    html.push(`<div><div class="header">${date.toISOString()} ${j.id} (${j.seq})</div><div class="joke">${j.joke}</div></div>`);
  });
  table.innerHTML = html.join('');
}

async function getDb() {
  if (this.db) {
    return Promise.resolve(this.db);
  }
  return new Promise(resolve => {
    const openRequest = indexedDB.open("chuck", 1);

    openRequest.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('jokes', { keyPath: 'id' });
    };

    openRequest.onsuccess = event => {
      this.db = event.target.result;
      resolve(this.db);
    }
  });
}

init();
