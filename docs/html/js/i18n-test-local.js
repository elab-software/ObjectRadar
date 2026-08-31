console.log("i18n.js loaded");

fetch("locales/en.json")
    .then(response => {
        console.log("JSON status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Translations:", data);
    })
    .catch(error => {
        console.error("i18n error:", error);
    });

/* =========================================================
   Object Radar — Internationalisation
   ========================================================= */

/* Langue utilisée lorsque rien n'est encore enregistré. */
const DEFAULT_LANGUAGE = "en";

/* Langues actuellement disponibles. */
const SUPPORTED_LANGUAGES = ["fr", "en"];


/* ---------------------------------------------------------
   Récupère la langue demandée dans l'URL.
   Exemple :
   /fr/ → fr
   /en/ → en
   --------------------------------------------------------- */
function getLanguageFromURL() {
    const parts = window.location.pathname.split("/");

    const language = parts[1];

    if (SUPPORTED_LANGUAGES.includes(language)) {
        return language;
    }

    return null;
}


/* ---------------------------------------------------------
   Détermine la langue à utiliser.

   Priorité :
   1. langue présente dans l'URL
   2. langue mémorisée
   3. langue du navigateur
   4. anglais par défaut
   --------------------------------------------------------- */
function getCurrentLanguage() {

    const urlLanguage = getLanguageFromURL();

    if (urlLanguage) {
        return urlLanguage;
    }

    const savedLanguage = localStorage.getItem("language");

    if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        return savedLanguage;
    }

    const browserLanguage =
        navigator.language.toLowerCase().split("-")[0];

    if (SUPPORTED_LANGUAGES.includes(browserLanguage)) {
        return browserLanguage;
    }

    return DEFAULT_LANGUAGE;
}


/* ---------------------------------------------------------
   Récupère une valeur dans l'objet de traduction.

   Exemple :
   "problem.title"

   devient :
   translations.problem.title
   --------------------------------------------------------- */
function getTranslation(translations, key) {

    return key
        .split(".")
        .reduce((object, property) => object?.[property], translations);
}


/* ---------------------------------------------------------
   Charge le fichier JSON correspondant à la langue.
   --------------------------------------------------------- */
async function loadTranslations(language) {

    const response =
        await fetch(`locales/${language}.json`);

    if (!response.ok) {
        throw new Error(
            `Unable to load translations for "${language}".`
        );
    }

    return response.json();
}


/* ---------------------------------------------------------
   Applique les traductions aux éléments HTML.

   Chaque élément doit posséder :
   data-i18n="section.key"
   --------------------------------------------------------- */
function applyTranslations(translations) {

    document.querySelectorAll("[data-i18n]").forEach((element) => {

        const key = element.dataset.i18n;
        const value = getTranslation(translations, key);

        if (value === undefined) {
            console.warn(`Missing translation: ${key}`);
            return;
        }

        /* innerHTML permet notamment de conserver <br>. */
        element.innerHTML = value;
    });
}


/* ---------------------------------------------------------
   Initialise le système de traduction.
   --------------------------------------------------------- */
async function initLanguage() {

    const language = DEFAULT_LANGUAGE;
    /* const language = getCurrentLanguage(); */
    
    try {

        const translations =
            await loadTranslations(language);

        applyTranslations(translations);

        /* Informe également le navigateur de la langue du document. */
        document.documentElement.lang = language;

        /* Mémorise le choix actuel. */
        localStorage.setItem("language", language);

    } catch (error) {

        console.error("Language initialization failed:", error);

    }
}


/* ---------------------------------------------------------
   Lancement après chargement du HTML.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", initLanguage);