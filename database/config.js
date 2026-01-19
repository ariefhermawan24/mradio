import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";

export const firebaseConfig = {
    apiKey: "AIzaSyDIOruw2ioQGb1aESlsL4oXieqxufO6Tjg",
    authDomain: "mradio-740cf.firebaseapp.com",
    databaseURL: "https://mradio-740cf-default-rtdb.firebaseio.com",
    projectId: "mradio-740cf",
    storageBucket: "mradio-740cf.firebasestorage.app",
    messagingSenderId: "410198470021",
    appId: "1:410198470021:web:3951573aba109b7fb328ec",
    measurementId: "G-R89DW3SH14"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// App Check Enterprise
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6LcDrU0sAAAAABXLZdgzEDp4gCJLFzSMB62V5xtd"),
  isTokenAutoRefreshEnabled: true
});
