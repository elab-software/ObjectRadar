// --------------------------------------------------
//   Object Radar — Distributor banner
//   
//   Retrieves session parameters to display them into a banner
//   - icon
//   - name
//   - URL
//   - lead
//   - thanks
// --------------------------------------------------
// Data flow
//
// Session variables
//     ↓
// distributors.js
//     ↓
// distributors.json
//     ↓
// Distributor banner
//
// Session variables:
//     language  → language used for the QR redirection
//     seller    → distributor identifier
//
// distributors.json:
//     - uses the seller identifier as the distributor key
//     - stores all available distributor information
//     - stores translated content for each supported language
//
// distributors.js:
//     - retrieves the seller and language from the session
//     - retrieves the corresponding distributor from distributors.json
//     - selects the content matching the session language
//     - creates and displays the distributor banner
// --------------------------------------------------

(function () {
    const seller = sessionStorage.getItem("objectradar.seller");
    const langue = sessionStorage.getItem("objectradar.langue");

    console.log("seller - langue", seller, langue);
    
    if (!seller) {
        return;
    }

    // Load the distributor configuration from the
    // central redirection configuration file
    fetch("../../r/distributors.json", {
        cache: "no-store"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Unable to load redirect.json (${response.status})`);
            }

            return response.json();
        })
        .then(config => {

            // Retrieve the distributor associated with the
            // seller identifier stored in the current session
            const distributor =
                /*config.distributors &&
                config.distributors[seller];*/
                config &&
                config[seller];

            // Do not display the banner if the seller is not
            // defined or is not present in the distributor configuration file
            if (!distributor) {
                return;
            }

            createBanner(distributor, langue); // Create a banner
        })
        .catch(error => {
            console.error("Distributor banner error:", error);
        });
    
    // --------------------------------------------------
    // Create and display the distributor banner
    // using the distributor information defined
    // in redirect.json
    // --------------------------------------------------
    function createBanner(distributor, langue) {
        const banner = document.createElement("aside");

        console.log("Valeur distributeur", distributor);
        console.log("Valeur langue", langue);

        const name = distributor.name[langue];
        const message = distributor.message[langue];
        const website = distributor.website[langue];
        const catchphrase = distributor.catchphrase[langue];

        console.log("name.language", name);


        banner.className = "distributor-banner";

        // Banner inner HTML code
        banner.innerHTML = `
            <button
                class="distributor-banner-close"
                type="button"
                aria-label="Close"
            >
                ×
            </button>

            <div class="distributor-banner-content">
                <div class="distributor-banner-header">

                    <a
                        href="${website}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src="${distributor.logo}"
                            alt=""
                            class="distributor-banner-logo"
                        >

                        <strong class="distributor-banner-name">
                            ${name}
                        </strong>
                    </a>
                   
                </div>

                <p class="distributor-banner-message">
                    ${message}
                </p>

                <p class="distributor-banner-catchphrase">
                    ${catchphrase}
                </p>
            </div>
        `;

        // Add the distributor banner to the current page
        document.body.appendChild(banner);

        banner
            .querySelector(".distributor-banner-close")
            
            // Allow the user to dismiss the banner
            // without storing any persistent preference
            .addEventListener("click", function () {
                banner.remove();
            });

    } // End function createBanner()

})();