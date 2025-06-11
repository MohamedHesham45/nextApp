import { useAuth } from "@/app/context/AuthContext";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
};

const getFbclid = () => {
    if (typeof window === 'undefined') return '';
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('fbclid') || '';
};

const createMetaConversionSender = (profile) => {
    return async (eventName, eventData, userIp, userAgent) => {
        if (!profile || Object.keys(profile).length === 0) return;

        // Get Facebook cookies and click ID
        const fbclid = getFbclid();
        const fbc = getCookie('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : '');
        const fbp = getCookie('_fbp') || '';

        // If fbclid exists but no _fbc cookie, set it
        if (fbclid && !getCookie('_fbc')) {
            const domain = window.location.hostname;
            const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
            document.cookie = `_fbc=${fbcValue}; domain=${domain}; path=/; max-age=7776000`; // 90 days
        }

        const payload = {
            eventName,
            userData: {
                em: profile.email,
                ph: profile.phone,
                fn: profile.name,
                ln: profile.name,
                external_id: profile._id,
                client_ip_address: userIp,
                client_user_agent: userAgent,
                ...(fbc && { fbc }),
                ...(fbp && { fbp }),
            },
            customData: {
                ...eventData,
                currency: 'EGP',
            },
            eventSourceUrl: window.location.href,
        };


        try {
            const response = await fetch('/api/meta-conversion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error('Meta Conversion API error:', await response.text());
            } else {
                const responseData = await response.json();
               

            }

        } catch (error) {
            console.error('Error sending Meta Conversion:', error);
        }
    };
};

const useMetaConversion = () => {
    const { profile } = useAuth();
    return createMetaConversionSender(profile);
};

export default useMetaConversion;