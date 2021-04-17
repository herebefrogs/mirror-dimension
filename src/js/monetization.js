// Web Monetization wrapper API

let monetizationEnabled = false;
let paid = 0;
let currency = '';


export const isMonetizationEnabled = () => monetizationEnabled;

export const monetizationEarned = () => `${paid} ${currency}`;

function disableMonetization() {
  // flag monetization as active
  monetizationEnabled = false;
  // add listeners
  document.monetization.addEventListener('monetizationstart', enableMonetization);
  // clean up listener
  document.monetization.removeEventListener('monetizationprogress', paymentCounter);
  document.monetization.removeEventListener('monetizationstop', disableMonetization);
}

function paymentCounter({ detail }) {
  paid += detail.amount / Math.pow(10, detail.assetScale);
  currency = detail.assetCode;
}

/**
 * Check for Web Monetization support and trigger the provided callback function
 * when web monetization has started (e.g. user is confirmed to be a Coil subscriber)
 * @params (*) callback function unlocking extra content warranted by the web monetization payments
 */
export function checkMonetization(callback) {
  function enableMonetization() {
    // flag monetization as active
    monetizationEnabled = true;
    // add listeners
    document.monetization.addEventListener('monetizationprogress', paymentCounter);
    document.monetization.addEventListener('monetizationstop', disableMonetization);
    // clean up listener
    document.monetization.removeEventListener('monetizationstart', enableMonetization);
    // trigger custom code
    callback();
  }

  if (document.monetization) {
    // check if Web Monetization has started
    if (document.monetization.state === 'started') {
      enableMonetization();
    // or setup a listener for when Web Monetization has finished starting
    } else if (document.monetization.state === 'pending') {
      disableMonetization();
    }
  }
}
