/* =========================================================
   Object Radar — Internationalisation
   ========================================================= */

/* Language used when nothing has been stored yet. */
const DEFAULT_LANGUAGE = "en";

/* Currently available languages. */
const SUPPORTED_LANGUAGES = ["fr", "en"];


/* ---------------------------------------------------------
   Retrieves the language requested in the URL.
   Example :
   /fr/ → fr
   /en/ → en
   --------------------------------------------------------- */
function getLanguageFromURL() {
    const parts = window.location.pathname.split("/");

    const htmlIndex = parts.indexOf("html");

    if (htmlIndex !== -1) {
        const language = parts[htmlIndex + 1];

        if (SUPPORTED_LANGUAGES.includes(language)) {
            return language;
        }
    }

    return null;
}


/* ---------------------------------------------------------
   Determines which language to use.
   
   Priority:
   1. language specified in the URL
   2. stored language
   3. browser language
   4. English by default
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

    const browserLanguage = navigator.language.toLowerCase().split("-")[0];

    if (SUPPORTED_LANGUAGES.includes(browserLanguage)) {
        return browserLanguage;
    }

    return DEFAULT_LANGUAGE;
}


/* ---------------------------------------------------------
   Retrieves a value from the translation object.
   
   Example:
   "problem.title"
   
   becomes:
   translations.problem.title
   --------------------------------------------------------- */
function getTranslation(translations, key) {

    return key
        .split(".")
        .reduce((object, property) => object?.[property], translations);
}


/* ---------------------------------------------------------
   Loads the JSON file corresponding to the selected language
   --------------------------------------------------------- */
async function loadTranslations(language) {

    const response = await fetch(`../locales/${language}.json`);

    if (!response.ok) {
        throw new Error(
            `Unable to load translations for "${language}".`
        );
    }

    return response.json();
}


/* ---------------------------------------------------------
   Applies translations to HTML elements.
   
   Each element must have:
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

        /* innerHTML allows HTML elements such as <br> to be preserved. */
        element.innerHTML = value;
    });
}


/* ---------------------------------------------------------
   Initializes the translation system.
   --------------------------------------------------------- */
async function initLanguage() {

    /*const language = DEFAULT_LANGUAGE;*/
    const language = getCurrentLanguage();
    
    try {

        const translations = await loadTranslations(language);

        applyTranslations(translations);

        /* Also informs the browser of the document language. */
        document.documentElement.lang = language;

        /* Stores the current language selection. */
        localStorage.setItem("language", language);
        
    } catch (error) {

        console.error("Language initialization failed:", error);

    }
}


/* ---------------------------------------------------------
   Starts the translation system after the HTML has been loaded.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", initLanguage);