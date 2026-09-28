/*!
 * INSM · Guardia de sesión (lado cliente)
 * Uso: en <head>, ANTES de cualquier otro script y sin "defer"/"async":
 *   <script src="assets/auth-guard.js"></script>
 * Compatible con assets/auth.js (clave "insm-session-v1").
 *
 * IMPORTANTE: localStorage es controlable por el usuario. Esto sirve para
 * ordenar la navegación, NO para proteger información confidencial.
 */
(function () {
  "use strict";

  var SESSION_KEY = "insm-session-v1";
  var LOGIN_URL = "index.html";
  var DOMAIN_RE = /^[^\s@]+@institutolamerced\.edu\.ar$/;

  function getSession() {
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!s || typeof s !== "object") return null;
      if (s.type === "anonymous") return s;
      if (s.type === "institutional" && typeof s.email === "string" && DOMAIN_RE.test(s.email)) return s;
      return null;
    } catch (e) {
      return null;
    }
  }

  function goToLogin() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    window.location.replace(LOGIN_URL);
  }

  // Oculta la página hasta confirmar la sesión (evita ver el contenido antes del redirect)
  var root = document.documentElement;
  var hideStyle = document.createElement("style");
  hideStyle.id = "insm-guard-hide";
  hideStyle.textContent = "html{visibility:hidden}";
  root.appendChild(hideStyle);

  function reveal() {
    var el = document.getElementById("insm-guard-hide");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  if (!getSession()) {
    goToLogin();
    return; // la página queda oculta mientras redirige
  }
  reveal();

  // Si vuelven con el botón "atrás" (bfcache) o cierran sesión en otra pestaña
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && !getSession()) goToLogin();
  });
  window.addEventListener("storage", function (e) {
    if (e.key === SESSION_KEY && !getSession()) goToLogin();
  });

  // Utilidad opcional para un botón "Cerrar sesión": onclick="insmLogout()"
  window.insmLogout = function () {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    window.location.replace(LOGIN_URL);
  };
})();
