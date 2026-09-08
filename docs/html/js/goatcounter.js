/* =========================================================
   Object Radar — GOAT COUNTER
   
   This web analystic (hosted service) gives some web pages 
   information (counter, country, navigator, campaign, etc.)
   
   The script code to be inserted into an HTML file is
   <!--script data-goatcounter="https://objectradar.goatcounter.com/count" async src="//gc.zgo.at/count.js""></script-->
   
   The URL is linked to objectradar account
   ========================================================= */

// 1. Create a new script element dynamically
const goatCounterScript = document.createElement('script');

// 2. Set the required attributes
goatCounterScript.src = "//gc.zgo.at/count.js";
goatCounterScript.async = true;

// Use setAttribute for custom data attributes
goatCounterScript.setAttribute('data-goatcounter', 'https://objectradar.goatcounter.com/count');

// 3. Append the script to the <head> to inject it into the page
document.body.appendChild(goatCounterScript);