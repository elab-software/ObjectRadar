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
        // 4. Valid use case
        //    → use-case default destination
        // --------------------------------------------------
        // Gets the use-case into the URL and get the value into default "use-case" key
        const useCaseConfig = useCaseDefaults[useCase];

        // Assign the destination with an redirected URL with default "use-case" AND "language"
        const destination = useCaseConfig[validLanguage] || siteDefaults[validLanguage];
        
        console.log("ObjectRadar : destination");
        console.log({destination});

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

        /*
        // Temporary debug information
        console.log("ObjectRadar QR redirect");
        console.log("ObjectRadar QR redirect");
        console.log("language:", validLanguage);
        console.log("useCase:", useCase);
        console.log("seller:", seller);
        console.log("destination:", destination);
        console.log("campaign:", campaign);
        console.log("source:", source);
        */

        // --------------------------------------------------
        // 8. Redirect
        // --------------------------------------------------
        // Call the function to redirect the user to the new URL
        redirect(destination);

    } catch (error) {
        console.error("QR redirect error:", error);

        // Safe fallback
        redirect("../html/en/index.html");
    }

    // ------------------------------------------------------
    // Redirect helper
    // ------------------------------------------------------

    function redirect(destination) {
        window.location.replace(destination);
    }
})();