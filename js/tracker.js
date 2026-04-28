/* ============================================================
   PORTFOLIO VISITOR TRACKER — Google Sheets Backend
   Sends real visitor data to Google Apps Script endpoint
   which stores it in a Google Sheet for cross-device analytics.
   ============================================================ */
(function() {
  'use strict';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ CONFIGURATION — Paste your Google Apps Script URL below
  // Deploy the analytics Apps Script and paste the URL here.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmgwLbFb4JF5dPQ6wio0pUuK2UwffemwPd0SgBaqxx5MfORQzQUHX7EZ83L7s_gNxt/exec'; // <-- PASTE YOUR APPS SCRIPT WEB APP URL HERE

  // Don't track admin page visits
  if (location.pathname.indexOf('admin') !== -1) return;

  // Parse basic device info from user-agent
  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'Mobile';
    if (/iPad|Tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg') > -1) return 'Edge';
    if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) return 'Opera';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    return 'Other';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    return 'Other';
  }

  // Collect visit data
  var visitData = {
    timestamp: new Date().toISOString(),
    page: location.pathname.split('/').pop() || 'index.html',
    referrer: document.referrer || 'direct',
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    device: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    language: navigator.language || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
  };

  // Send data to Google Apps Script (fire and forget)
  if (SCRIPT_URL) {
    try {
      navigator.sendBeacon(SCRIPT_URL, JSON.stringify(visitData));
    } catch(e) {
      // Fallback to fetch if sendBeacon fails
      try {
        fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(visitData)
        }).catch(function(){});
      } catch(e2) {}
    }
  }
})();
