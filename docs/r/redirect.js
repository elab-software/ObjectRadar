// V1 - Website redirections
// 30/09/2026
//
// /r/redirect.js
// URL https://www.ealb...io.com/r/index.html?langauge=fr/en&use-case=xxxxx&seller=xxxxx
// ------------------------------------------------------------

(async function () {
    const params = new URLSearchParams(window.location.search);
    
    /* Retrieve URL parameters */
    const language = params.get("language");
    const useCase = params.get("use-case");
    const seller = params.get("seller");

    /*
    console.log({language});
    console.log({useCase});
    console.log({seller});
    */

    // --------------------------------------------------
    // 0. Change some element with the language in the URL
    // - Title
    // - Redirection message
    // --------------------------------------------------
    const titleTranslation = {
        en: "ObjectRadar – Redirecting",
        fr: "ObjectRadar – Redirection"
    }

    // Change the tab text according to the current language
    document.title = titleTranslation[language] || titleTranslation["en"];

    // Change the redirection message according to the current language
    const message = document.getElementById("redirect-message");

    const redirectionTranslation = {
        en: "Redirecting…",
        fr: "Redirection en cours…"
    }

    if (message) { 
        message.textContent = redirectionTranslation[language] || redirectionTranslation["en"];
    }
    
    /*
    console.log(document.title);
    console.log(message.textContent);
    */
    
    try {
        // Load redirect configuration
        const response = await fetch("./redirect.json", {
            cache: "no-store"
        });

        /*
        console.log("status :", response.status);
        console.log("content-type :", response.headers.get("content-type"));
        */

        if (!response.ok) {
            throw new Error(`Unable to load redirect.json (${response.status})`);
        }
        const config = await response.json();

        const defaultConfig = config.default;     // Gets the "default" keys
        const siteDefaults = defaultConfig.site;  // Gets the "site" keys into "default" key
        const useCaseDefaults = defaultConfig["use-cases"]; // Gets "uses-cases" keys (don't use '.use-case because of the hyphen')
        const qrCampaigns = config.qr;

        // --------------------------------------------------
        // 1. Validate language
        // --------------------------------------------------
        // Check the language into the URL with the default languages enabled in JSON file
        // otherwise return "en" language
        const validLanguage = language && Object.prototype.hasOwnProperty.call(siteDefaults, language)
                ? language
                : "en";

        // --------------------------------------------------
        // 2. Validate use case
        // --------------------------------------------------
        // Check the "use-case" into the URL with the default use-cases enabled
        const validUseCase = useCase && Object.prototype.hasOwnProperty.call(useCaseDefaults, useCase);

        /*
        console.log("ObjectRadar : validUseCase");
        console.log({validUseCase});
        */
        
        // --------------------------------------------------
        // 3. Invalid use case
        //    → site default for the selected language
        // --------------------------------------------------

        if (!validUseCase) {
            redirect(siteDefaults[validLanguage]); // return the default page + language
            return;
        }

        // --------------------------------------------------
        // 4. Valid use case destination
        //    → use-case default destination
        // --------------------------------------------------
        // Gets the use-case into the URL and get the value into default "use-case" key
        const useCaseConfig = useCaseDefaults[useCase];

        // Assign the destination with an redirected URL with default "use-case" AND "language"
        const destination = useCaseConfig[validLanguage] || siteDefaults[validLanguage];
        
        /*
        console.log("ObjectRadar : destination");
        console.log({destination});
        */

        // --------------------------------------------------
        // 5. Build QR campaign key
        //
        // Format : language + use-case + seller
        //    ex. : fr-hearing-seller-1
        // --------------------------------------------------

        let campaign = null;
        let source = null;

        // The URL gets "seller" paramater
        if (seller) {
            const qrKey = `${validLanguage}-${useCase}-${seller}`; // Construct a key from URL parameters
            const qrCampaign = qrCampaigns[qrKey]; // Gets into JSON file the value of "qrkey"

            // --------------------------------------------------
            // 6. Known and active campaign
            // --------------------------------------------------

            if (qrCampaign && qrCampaign.active === true) {
                campaign = qrCampaign.campaign || null;
                source = qrCampaign.source || null;
            }

            // --------------------------------------------------
            // 7. Unknown or inactive campaign
            //    → keep use-case destination
            //    → no commercial attribution
            // --------------------------------------------------
        }

        // --------------------------------------------------
        // Debug information (temporary)
        // --------------------------------------------------
        /*
        console.log("ObjectRadar QR redirect");
        console.log("language:", validLanguage);
        console.log("useCase:", useCase);
        console.log("seller:", seller);
        console.log("destination:", destination);
        console.log("campaign:", campaign);
        console.log("source:", source);
        */

        // --------------------------------------------------
        // 8. Redirect (before implementing GoatCounter temporary redirection)
        // --------------------------------------------------
        // Call the function to redirect the user to the new URL
        // redirect(destination);

        // --------------------------------------------------
        // 6. Track and redirect
        // --------------------------------------------------

        await trackAndRedirect(destination, campaign, source);

    } catch (error) {
        console.error("QR redirect error:", error);

        // Safe fallback
        redirect("../html/en/index.html");
    }

    // ------------------------------------------------------
    // GoatCounter + redirect
    // ------------------------------------------------------

    async function trackAndRedirect(destination, campaign, source)
        {
        try {
            // Campaign tracking only for active QR campaigns
            if (campaign && source) {

                // Add GoatCounter-compatible parameters
                // to the current URL temporarily.
                // tracking URL https://www.ealb...io.com/r/index.html?langauge=fr/en&use-case=xxxxx&seller=xxxxx&campaign=xxxx&source=xxxxx
                const trackingURL = new URL(window.location.href);

                trackingURL.searchParams.set(
                    "campaign",
                    campaign
                );

                trackingURL.searchParams.set(
                    "source",
                    source
                );
                
                // Change temporarily the current URL in the toolbar without charging it and display it
                // wihtout website history, just to allow GoatCounter to receive the parameters in the URL
                window.history.replaceState(
                    {},
                    "",
                    trackingURL
                );

                // console.log("trackingURL:", trackingURL);
            }

            // Wait until GoatCounter is available
            await waitForGoatCounter();

            // Explicit pageview recording when receiving the parameters in the temporary URL even the page is not displayed
            // This is necessary because automatic counting is disabled ("no_onload" parameter) in the "index" page script code
            // A "pageview" is every time a page is loaded, it is counted instead of "visit" when the first time someone loads a page
            window.goatcounter.count({
                path: destination
            });

            // console.log("GoatCounter pageview sent");
            
        } catch (error) {
            // Tracking must never block navigation
            console.warn(
                "GoatCounter tracking failed:",
                error
            );
        }

        // Short delay to allow the request to start
        setTimeout(function () {
            redirect(destination);
        }, 300);
    }

    // ------------------------------------------------------
    // Wait for GoatCounter
    // ------------------------------------------------------

    function waitForGoatCounter() {
        // Avoid to redirect while counting is not done
        return new Promise(function (resolve, reject) {
            const timeout = 2000;
            const interval = 50;
            let elapsed = 0;

            const timer = setInterval(function () {

                if (
                    window.goatcounter &&                           // check whether the object exists
                    typeof window.goatcounter.count === "function"  // check whether the count function exists
                ) {
                    clearInterval(timer);
                    resolve();
                    return;
                }

                elapsed += interval;

                if (elapsed >= timeout) {
                    clearInterval(timer);
                    reject(
                        new Error("GoatCounter timeout")
                    );
                }

            }, interval);
        });
    }

    // ------------------------------------------------------
    // Redirect helper
    // ------------------------------------------------------

    function redirect(destination) {
        window.location.replace(destination);
    }
})();