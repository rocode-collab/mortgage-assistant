// Chat state
let currentStep = 0;
let userInfo = {
    isFirstTimeBuyer: null,
    hasPreApproval: null,
    timeline: null,
    fullName: null,
    email: null,
    phone: null,
    previousResponses: [],
    mood: 'friendly',
    lastInteractionTime: Date.now(),
    isLead: false,
    leadSource: 'chat',
    leadStatus: 'new',
    conversationContext: []
};

// Personality traits and response templates
const personality = {
    friendly: {
        greetings: [
            "Hi there! 👋 I'm your friendly mortgage assistant. How can I help you today?",
            "Hello! I'm here to help with your mortgage journey. What brings you here today?",
            "Hey! Great to meet you! I'm your mortgage buddy - how can I assist you today?"
        ],
        encouragements: [
            "That's great to hear! 😊",
            "I'm glad you're taking this step!",
            "You're doing great! Let's keep going."
        ],
        clarifications: [
            "I want to make sure I understand correctly - ",
            "Let me clarify something - ",
            "Just to be clear - "
        ],
        objections: [
            "I understand you're not ready right now. Would you like to receive some helpful mortgage tips via email instead?",
            "That's completely fine! Would you like to stay updated with the latest mortgage rates and market insights?",
            "No problem at all! Would you like to receive a free mortgage calculator to help you plan for the future?"
        ],
        leadConversion: [
            "Before you go, would you like to receive our free mortgage guide? It's packed with valuable insights!",
            "I'd love to send you some helpful resources about the home buying process. Would that be okay?",
            "Would you like to receive our weekly mortgage market updates? It's free and you can unsubscribe anytime."
        ]
    }
};

// ChatGPT configuration
const CHATGPT_CONFIG = {
    apiKey: CONFIG.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 150
};

// System prompt for ChatGPT
const SYSTEM_PROMPT = `You are a friendly and knowledgeable mortgage assistant. Your goal is to help users understand their mortgage options and guide them through the home buying process. 
Keep responses conversational and empathetic. Avoid hard selling or pushing products. Focus on understanding the user's needs and providing valuable information.
If the user seems unsure or not ready, offer helpful resources without being pushy.`;

// ChatGPT API call function
async function getChatGPTResponse(userMessage, context) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHATGPT_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: CHATGPT_CONFIG.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...context.map(msg => ({
                        role: msg.isUser ? 'user' : 'assistant',
                        content: msg.content
                    })),
                    { role: 'user', content: userMessage }
                ],
                temperature: CHATGPT_CONFIG.temperature,
                max_tokens: CHATGPT_CONFIG.maxTokens
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling ChatGPT:', error);
        return null;
    }
}

// Natural language understanding helpers
function analyzeUserInput(input) {
    const response = {
        sentiment: 'neutral',
        intent: null,
        confidence: 0,
        keywords: []
    };

    // Basic sentiment analysis
    const positiveWords = ['yes', 'great', 'awesome', 'perfect', 'love', 'good', 'excellent'];
    const negativeWords = ['no', 'bad', 'terrible', 'worried', 'concerned', 'difficult'];
    
    const words = input.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    response.sentiment = positiveCount > negativeCount ? 'positive' : 
                        negativeCount > positiveCount ? 'negative' : 'neutral';
    
    // Intent recognition
    if (input.toLowerCase().includes('help') || input.toLowerCase().includes('assist')) {
        response.intent = 'help';
        response.confidence = 0.8;
    } else if (input.toLowerCase().includes('buy') || input.toLowerCase().includes('purchase')) {
        response.intent = 'buy';
        response.confidence = 0.7;
    }
    
    // Keyword extraction
    response.keywords = words.filter(word => 
        word.length > 3 && 
        !['the', 'and', 'but', 'for', 'you', 'are', 'this', 'that'].includes(word)
    );
    
    return response;
}

// Dynamic response generation
function generateResponse(input, context) {
    const analysis = analyzeUserInput(input);
    const timeSinceLastInteraction = Date.now() - userInfo.lastInteractionTime;
    userInfo.lastInteractionTime = Date.now();
    
    // Store response for context
    userInfo.previousResponses.push({
        input,
        analysis,
        timestamp: Date.now()
    });
    
    // Generate contextual response
    let response = '';
    
    if (timeSinceLastInteraction > 300000) { // 5 minutes
        response = "Welcome back! I'm still here to help with your mortgage journey. ";
    }
    
    if (analysis.sentiment === 'positive') {
        response += personality[userInfo.mood].encouragements[
            Math.floor(Math.random() * personality[userInfo.mood].encouragements.length)
        ] + " ";
    }
    
    // Add contextual awareness
    if (userInfo.previousResponses.length > 1) {
        const previousResponse = userInfo.previousResponses[userInfo.previousResponses.length - 2];
        if (previousResponse.analysis.intent === 'help' && analysis.intent === 'buy') {
            response += "I'm glad you're interested in buying! Let me guide you through the process. ";
        }
    }
    
    return response;
}

// DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const shareFacebookBtn = document.getElementById('share-facebook');
const shareInstagramBtn = document.getElementById('share-instagram');
const shareTiktokBtn = document.getElementById('share-tiktok');

// Social media sharing URLs - Replace these with your actual URLs
const SHARE_URLS = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=YOUR_WEBSITE_URL',
    instagram: 'https://www.instagram.com/YOUR_INSTAGRAM_HANDLE',
    tiktok: 'https://www.tiktok.com/@YOUR_TIKTOK_HANDLE'
};

// Social media sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Check out this helpful Mortgage Assistant!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, 'facebook-share-dialog', 'width=626,height=436');
    if (window.trackChatInteraction) {
        window.trackChatInteraction('share_facebook');
    }
}

function shareOnInstagram() {
    window.open(SHARE_URLS.instagram, '_blank');
    if (window.trackChatInteraction) {
        window.trackChatInteraction('share_instagram');
    }
}

function shareOnTiktok() {
    window.open(SHARE_URLS.tiktok, '_blank');
    if (window.trackChatInteraction) {
        window.trackChatInteraction('share_tiktok');
    }
}

// Add event listeners for social media buttons
shareFacebookBtn.addEventListener('click', shareOnFacebook);
shareInstagramBtn.addEventListener('click', shareOnInstagram);
shareTiktokBtn.addEventListener('click', shareOnTiktok);

// Conversation flow
const conversation = [
    {
        bot: "Hi there! 👋 I'm your friendly mortgage assistant. How can I help you today?",
        next: "Would you like to do a quick Home Readiness Check? It only takes a few minutes!"
    },
    {
        bot: "Great! Let's get started with a few quick questions. Are you a first-time home buyer?",
        validate: (input) => {
            const response = input.toLowerCase();
            if (response.includes('yes') || response.includes('no')) {
                userInfo.isFirstTimeBuyer = response.includes('yes');
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('first_time_buyer_response', { isFirstTimeBuyer: userInfo.isFirstTimeBuyer });
                }
                return true;
            }
            return false;
        },
        error: "Please answer with 'yes' or 'no'."
    },
    {
        bot: "Have you already been pre-approved for a mortgage?",
        validate: (input) => {
            const response = input.toLowerCase();
            if (response.includes('yes') || response.includes('no')) {
                userInfo.hasPreApproval = response.includes('yes');
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('pre_approval_response', { hasPreApproval: userInfo.hasPreApproval });
                }
                return true;
            }
            return false;
        },
        error: "Please answer with 'yes' or 'no'."
    },
    {
        bot: "What's your timeline for buying a home? (e.g., within 6 months, 1 year, etc.)",
        validate: (input) => {
            if (input.trim().length > 0) {
                userInfo.timeline = input.trim();
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('timeline_response', { timeline: userInfo.timeline });
                }
                return true;
            }
            return false;
        },
        error: "Please provide your timeline."
    },
    {
        bot: "Could you please share your full name?",
        validate: (input) => {
            if (input.trim().length > 0) {
                userInfo.fullName = input.trim();
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('name_provided');
                }
                return true;
            }
            return false;
        },
        error: "Please provide your full name."
    },
    {
        bot: "What's the best email address to reach you?",
        validate: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(input.trim())) {
                userInfo.email = input.trim();
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('email_provided');
                }
                return true;
            }
            return false;
        },
        error: "Please provide a valid email address."
    },
    {
        bot: "Would you like to share your phone number? (optional)",
        validate: (input) => {
            if (input.trim().length === 0) {
                userInfo.phone = null;
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('phone_skipped');
                }
                return true;
            }
            const phoneRegex = /^[\d\s-+()]{10,}$/;
            if (phoneRegex.test(input.trim())) {
                userInfo.phone = input.trim();
                if (window.trackChatInteraction) {
                    window.trackChatInteraction('phone_provided');
                }
                return true;
            }
            return false;
        },
        error: "Please provide a valid phone number or leave it blank."
    },
    {
        bot: "Thank you for sharing your information! Would you like to schedule a free 15-minute consultation with one of our mortgage experts?",
        validate: (input) => {
            const response = input.toLowerCase();
            if (response.includes('yes')) {
                window.open('https://calendly.com/your-link-here', '_blank');
                if (window.trackScheduleConsultation) {
                    window.trackScheduleConsultation();
                } else if (window.trackChatInteraction) {
                    window.trackChatInteraction('consultation_scheduled');
                }
            } else if (window.trackChatInteraction) {
                window.trackChatInteraction('consultation_declined');
            }
            return true;
        }
    },
    {
        bot: "Thank you for chatting with me! I've saved your information and someone from our team will be in touch soon. Have a great day! 😊",
        onComplete: () => {
            // Track completion of the entire chat flow
            if (window.trackCompleteCheck) {
                window.trackCompleteCheck(userInfo);
            }
            if (window.trackProvideContact) {
                window.trackProvideContact(userInfo);
            }
        }
    }
];

// Helper functions
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
}

function removeTypingIndicator(indicator) {
    if (indicator) {
        indicator.remove();
    }
}

// Lead conversion functions
function convertToLead(userInfo) {
    userInfo.isLead = true;
    userInfo.leadStatus = 'converted';
    
    // Here you would typically send this data to your CRM or email marketing system
    if (window.trackLeadConversion) {
        window.trackLeadConversion(userInfo);
    }
    
    // Store lead in localStorage for persistence
    localStorage.setItem('chatLead', JSON.stringify(userInfo));
}

function handleNegativeResponse(input) {
    const analysis = analyzeUserInput(input);
    const negativeResponses = ['no', 'not interested', 'maybe later', 'not now', 'not ready'];
    
    if (negativeResponses.some(response => input.toLowerCase().includes(response))) {
        return true;
    }
    return false;
}

// Update the processUserInput function
async function processUserInput(input) {
    const currentConversation = conversation[currentStep];
    
    // Add user message to context
    userInfo.conversationContext.push({
        content: input,
        isUser: true,
        timestamp: Date.now()
    });

    // Check for negative response at the start
    if (currentStep === 0 && handleNegativeResponse(input)) {
        const indicator = showTypingIndicator();
        
        // Get personalized response from ChatGPT
        const chatGPTResponse = await getChatGPTResponse(
            `User said they're not interested in the assessment right now. Generate a friendly, non-pushy response that offers helpful resources.`,
            userInfo.conversationContext
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        removeTypingIndicator(indicator);
        
        // Use ChatGPT response if available, otherwise fall back to template
        const response = chatGPTResponse || personality[userInfo.mood].leadConversion[
            Math.floor(Math.random() * personality[userInfo.mood].leadConversion.length)
        ];
        
        addMessage(response, false);
        userInfo.conversationContext.push({
            content: response,
            isUser: false,
            timestamp: Date.now()
        });

        // Add a new conversation step for lead conversion
        conversation.splice(1, 0, {
            bot: "If you'd like, I can send you some helpful resources about mortgages and home buying. Just share your email address, and I'll make sure you get the most relevant information.",
            validate: (input) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(input.trim())) {
                    userInfo.email = input.trim();
                    convertToLead(userInfo);
                    return true;
                }
                return false;
            },
            error: "Please provide a valid email address.",
            next: "Thanks! I'll send you some helpful resources. Feel free to reach out whenever you're ready to explore your mortgage options."
        });
        
        return;
    }

    if (currentConversation.validate) {
        if (!currentConversation.validate(input)) {
            const indicator = showTypingIndicator();
            
            // Get personalized error response from ChatGPT
            const chatGPTResponse = await getChatGPTResponse(
                `User provided invalid input: "${input}". Generate a friendly, helpful error message.`,
                userInfo.conversationContext
            );
            
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            removeTypingIndicator(indicator);
            
            const errorMessage = chatGPTResponse || currentConversation.error;
            addMessage(errorMessage, false);
            userInfo.conversationContext.push({
                content: errorMessage,
                isUser: false,
                timestamp: Date.now()
            });
            return;
        }
    }

    if (currentConversation.next) {
        currentStep++;
        const indicator = showTypingIndicator();
        
        // Get personalized next message from ChatGPT
        const chatGPTResponse = await getChatGPTResponse(
            `Generate the next question in the mortgage assessment flow, considering the user's previous responses: ${JSON.stringify(userInfo)}`,
            userInfo.conversationContext
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        removeTypingIndicator(indicator);
        
        const nextMessage = chatGPTResponse || conversation[currentStep].bot;
        addMessage(nextMessage, false);
        userInfo.conversationContext.push({
            content: nextMessage,
            isUser: false,
            timestamp: Date.now()
        });
    } else if (currentStep < conversation.length - 1) {
        currentStep++;
        const indicator = showTypingIndicator();
        
        // Get personalized response from ChatGPT
        const chatGPTResponse = await getChatGPTResponse(
            `Generate a response for the next step in the conversation, considering the user's previous responses: ${JSON.stringify(userInfo)}`,
            userInfo.conversationContext
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        removeTypingIndicator(indicator);
        
        const response = chatGPTResponse || conversation[currentStep].bot;
        addMessage(response, false);
        userInfo.conversationContext.push({
            content: response,
            isUser: false,
            timestamp: Date.now()
        });
        
        if (currentStep === conversation.length - 1 && conversation[currentStep].onComplete) {
            conversation[currentStep].onComplete();
        }
    }
}

// Event listeners
sendButton.addEventListener('click', () => {
    const input = userInput.value.trim();
    if (input) {
        addMessage(input, true);
        userInput.value = '';
        processUserInput(input);
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

// Start conversation
window.addEventListener('load', () => {
    addMessage(conversation[0].bot, false);
    setTimeout(() => {
        addMessage(conversation[0].next, false);
        // Track that chat has started
        if (window.trackStartChat) {
            window.trackStartChat();
        } else if (window.trackChatInteraction) {
            window.trackChatInteraction('start_chat');
        }
    }, 1000);
}); 