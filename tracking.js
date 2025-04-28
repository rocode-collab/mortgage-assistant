// Tracking configuration
const TRACKING = {
    enabled: true,
    storageKey: 'mortgage_assistant_tracking',
    endpoints: {
        // Replace these with your actual tracking endpoints
        facebook: 'YOUR_FACEBOOK_PIXEL_ID',
        instagram: 'YOUR_INSTAGRAM_PIXEL_ID',
        tiktok: 'YOUR_TIKTOK_PIXEL_ID'
    },
    // Define standard events for consistent tracking
    events: {
        PAGE_VIEW: 'PageView',
        START_CHAT: 'StartChat',
        COMPLETE_CHECK: 'CompleteCheck',
        PROVIDE_CONTACT: 'ProvideContact',
        SCHEDULE_CONSULTATION: 'ScheduleConsultation',
        SHARE_SOCIAL: 'ShareSocial'
    }
};

// Track user source and interaction
function trackUser(source, action, data = {}) {
    if (!TRACKING.enabled) return;

    const trackingData = {
        source: source,
        action: action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        ...data
    };

    // Store in local storage for persistence
    const storedData = JSON.parse(localStorage.getItem(TRACKING.storageKey) || '[]');
    storedData.push(trackingData);
    localStorage.setItem(TRACKING.storageKey, JSON.stringify(storedData));

    // Send to appropriate tracking endpoint based on source
    if ((source === 'facebook' || source === 'instagram') && TRACKING.endpoints.facebook) {
        // Facebook/Instagram Pixel tracking
        if (typeof fbq !== 'undefined') {
            // Map our custom events to Facebook standard events
            const fbEvent = mapToFacebookEvent(action, data);
            fbq('track', fbEvent.name, fbEvent.data);
            
            // Log for debugging
            console.log(`Facebook event tracked: ${fbEvent.name}`, fbEvent.data);
        }
    } else if (source === 'tiktok' && TRACKING.endpoints.tiktok) {
        // TikTok Pixel tracking
        if (typeof ttq !== 'undefined') {
            // Map our custom events to TikTok standard events
            const ttEvent = mapToTikTokEvent(action, data);
            ttq.track(ttEvent.name, ttEvent.data);
            
            // Log for debugging
            console.log(`TikTok event tracked: ${ttEvent.name}`, ttEvent.data);
        }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Tracking:', trackingData);
    }
}

// Map our custom events to Facebook standard events
function mapToFacebookEvent(action, data) {
    // Default event data
    const eventData = {
        content_name: 'Mortgage Assistant',
        content_category: 'Financial Services',
        ...data
    };
    
    // Map our events to Facebook standard events
    switch(action) {
        case 'page_view':
            return { name: 'PageView', data: eventData };
        case 'start_chat':
            return { name: 'StartChat', data: eventData };
        case 'complete_check':
            return { name: 'CompleteRegistration', data: eventData };
        case 'provide_contact':
            return { name: 'Contact', data: eventData };
        case 'schedule_consultation':
            return { name: 'Schedule', data: eventData };
        case 'share_facebook':
        case 'share_instagram':
        case 'share_tiktok':
            return { name: 'Share', data: { ...eventData, method: action.replace('share_', '') } };
        default:
            // For custom events, use the action name directly
            return { name: action, data: eventData };
    }
}

// Map our custom events to TikTok standard events
function mapToTikTokEvent(action, data) {
    // Default event data
    const eventData = {
        content_name: 'Mortgage Assistant',
        content_category: 'Financial Services',
        ...data
    };
    
    // Map our events to TikTok standard events
    switch(action) {
        case 'page_view':
            return { name: 'PageView', data: eventData };
        case 'start_chat':
            return { name: 'StartChat', data: eventData };
        case 'complete_check':
            return { name: 'CompleteRegistration', data: eventData };
        case 'provide_contact':
            return { name: 'Contact', data: eventData };
        case 'schedule_consultation':
            return { name: 'Schedule', data: eventData };
        case 'share_facebook':
        case 'share_instagram':
        case 'share_tiktok':
            return { name: 'Share', data: { ...eventData, method: action.replace('share_', '') } };
        default:
            // For custom events, use the action name directly
            return { name: action, data: eventData };
    }
}

// Track page views
function trackPageView() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || 'direct';
    trackUser(source, 'page_view');
}

// Track chat interactions
function trackChatInteraction(action, data = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || 'direct';
    trackUser(source, action, data);
}

// Track specific events with detailed data
function trackStartChat() {
    trackChatInteraction('start_chat', { 
        value: 0.00, 
        currency: 'USD',
        chat_type: 'mortgage_assistant'
    });
}

function trackCompleteCheck(userData) {
    trackChatInteraction('complete_check', { 
        value: 0.00, 
        currency: 'USD',
        is_first_time_buyer: userData.isFirstTimeBuyer,
        has_pre_approval: userData.hasPreApproval,
        timeline: userData.timeline
    });
}

function trackProvideContact(userData) {
    trackChatInteraction('provide_contact', { 
        value: 0.00, 
        currency: 'USD',
        has_email: !!userData.email,
        has_phone: !!userData.phone
    });
}

function trackScheduleConsultation() {
    trackChatInteraction('schedule_consultation', { 
        value: 0.00, 
        currency: 'USD',
        consultation_type: 'mortgage_expert',
        duration_minutes: 15
    });
}

// Initialize tracking
document.addEventListener('DOMContentLoaded', () => {
    trackPageView();
});

// Export tracking functions
window.trackChatInteraction = trackChatInteraction;
window.trackStartChat = trackStartChat;
window.trackCompleteCheck = trackCompleteCheck;
window.trackProvideContact = trackProvideContact;
window.trackScheduleConsultation = trackScheduleConsultation; 