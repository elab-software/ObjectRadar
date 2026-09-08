/* =========================================================
   Object Radar — Common site data
   ========================================================= */

   /* ---------------------------------------------------------
   Retrieves a common value from the site data object.
   
   Example:
   "site.title"
   
   becomes:
   value.problem.title
   --------------------------------------------------------- */
function getSiteValue(common, key) {

    return key
        .split(".")
        .reduce((object, property) => object?.[property], common);
}


/* ---------------------------------------------------------
   Loads the JSON file corresponding to the selected language
   --------------------------------------------------------- */
async function loadSiteData() {

    const response = await fetch(`../data/site.json`);

    if (!response.ok) {
        throw new Error(
            `Unable to load common data for "site".`
        );
    }

    return response.json();
}


/* ---------------------------------------------------------
   Applies common site data to HTML elements.
   
   Each element must have:
   data-site="common.key"
   --------------------------------------------------------- */
function applySiteData(common) {

    document.querySelectorAll("[data-site]").forEach((element) => {

        const key = element.dataset.site;
        const value = getSiteValue(common, key);

        if (value === undefined) {
            console.warn(`Missing common: ${key}`);
            return;
        }

        /* innerHTML allows HTML elements such as <br> to be preserved. */
        element.innerHTML = value;
    });
}


/* ---------------------------------------------------------
   Initializes the common site data system.
   --------------------------------------------------------- */
async function initSite() {

    try {

        const siteData = await loadSiteData();

        applySiteData(siteData);
        
    } catch (error) {

        console.error("Language initialization failed:", error);

    }
}


/* ---------------------------------------------------------
   Starts the translation system after the HTML has been loaded.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", initSite);