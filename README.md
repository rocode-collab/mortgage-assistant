# Mortgage Assistant Chatbot

A conversational chatbot that helps users with mortgage-related questions and lead generation.

## Features

- Natural language processing with ChatGPT integration
- Lead generation and tracking
- Responsive design
- Real-time chat interface
- Error handling and validation

## Hosting Options

### 1. GitHub Pages (Free)

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload these files to your repository:
   - index.html
   - styles.css
   - script.js
4. Go to repository Settings > Pages
5. Select main branch as source
6. Your site will be available at `https://yourusername.github.io/repository-name`

### 2. Netlify (Free)

1. Create a Netlify account
2. Drag and drop your project folder to Netlify's upload area
3. Your site will be available at a random URL (you can customize it)

### 3. Vercel (Free)

1. Create a Vercel account
2. Connect your GitHub repository
3. Vercel will automatically deploy your site
4. Your site will be available at a random URL (you can customize it)

## Setup

1. Get your OpenAI API key from [OpenAI's website](https://platform.openai.com/)
2. Add your API key to the `CHATGPT_CONFIG.apiKey` field in `script.js`
3. Deploy using one of the hosting options above

## Local Development

1. Clone the repository
2. Open index.html in your browser
3. Make changes and test locally
4. Deploy when ready

## Security Notes

- Never commit your API key to the repository
- Consider using environment variables for sensitive data
- Implement rate limiting for API calls
- Add CORS headers if needed

## Customization

- Modify the `SYSTEM_PROMPT` in script.js to change the chatbot's personality
- Adjust the styling in styles.css
- Update the conversation flow in the conversation array 