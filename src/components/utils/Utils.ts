export const getBrowserInfo = async () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const appVersion = navigator.appVersion;
    const vendor = navigator.vendor;
    const location = await getLocationDetails();

    return { userAgent, platform, language, appVersion, vendor, location };
};

const getLocationDetails = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            (error) => {
                console.error("Error getting location:", error);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};
