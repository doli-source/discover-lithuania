(function () {
  var COOKIE_NAME = "niv_internal";
  var COOKIE_DAYS = 730;
  var URL_PARAM = "niv_internal";
  var AUTOMATION_UA_SIGNATURES = [
    "HeadlessChrome",
    "Playwright",
    "Puppeteer",
    "NivDevTool"
  ];

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get(URL_PARAM) === "1") {
    setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
  }

  var isSelfTagged = getCookie(COOKIE_NAME) === "1";
  var ua = navigator.userAgent || "";
  var isAutomationTool = AUTOMATION_UA_SIGNATURES.some(function (sig) { return ua.indexOf(sig) !== -1; });

  window.__trafficType = (isSelfTagged || isAutomationTool) ? "internal" : "real";
})();
