export const getBrowserInfo = async () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const appVersion = navigator.appVersion;
    const vendor = navigator.vendor;

    let location = null;
    try {
        location = await getLocationDetails();
    } catch (error) {
        console.warn("Location access denied or unavailable:", error.message);
    }

    return { userAgent, platform, language, appVersion, vendor, location };
};

const getLocationDetails = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error("User denied the request for Geolocation."));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error("Location information is unavailable."));
                        break;
                    case error.TIMEOUT:
                        reject(new Error("The request to get user location timed out."));
                        break;
                    default:
                        reject(new Error("An unknown error occurred while fetching location."));
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};