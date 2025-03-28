# Updating Styles with CloneX Frontend Styling

I'll help you replace the current CSS styling with the styles from the CloneX Frontend GitHub repository. Let's extract the relevant styling elements from that repository and adapt them to your Trend Avatar app.

Looking at the GitHub repository https://github.com/TommNum/clonex-frontend/tree/main/src, I can see it's using a combination of styled components, Tailwind CSS, and custom styles. Let's implement these styles in your application.

## Step 1: Install Required Dependencies

First, let's install the necessary packages to match the styling approach in the CloneX frontend:

```bash
npm install tailwindcss postcss autoprefixer daisyui @material-tailwind/react @heroicons/react
```

## Step 2: Configure Tailwind CSS

Create a `postcss.config.js` file in the root directory:

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create a `tailwind.config.js` file:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./views/**/*.ejs"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        twitter: {
          blue: '#1DA1F2',
          black: '#14171A',
          dark: '#657786',
          light: '#AAB8C2',
          extraLight: '#E1E8ED',
          extraExtraLight: '#F5F8FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#1DA1F2",
          "primary-focus": "#0d95e8",
        },
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#1DA1F2",
          "primary-focus": "#0d95e8",
        },
      },
    ],
  },
};
```

## Step 3: Update Public CSS

Replace your `public/css/style.css` with the following:

```css
/* public/css/style.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {
  --primary-color: #1DA1F2;
  --primary-hover: #0d95e8;
  --secondary-color: #14171A;
  --text-color: #657786;
  --light-text: #AAB8C2;
  --border-color: #E1E8ED;
  --bg-color: #F5F8FA;
  --success-color: #17bf63;
  --error-color: #e0245e;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--secondary-color);
  line-height: 1.5;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.btn-twitter {
  @apply bg-twitter-blue hover:bg-twitter-blue/90 text-white font-medium py-2 px-4 rounded-full transition duration-200;
}

.btn-twitter-outline {
  @apply bg-white text-twitter-blue border border-twitter-blue font-medium py-2 px-4 rounded-full hover:bg-twitter-blue/10 transition duration-200;
}

.btn-twitter-secondary {
  @apply bg-transparent hover:bg-twitter-extraLight text-twitter-black font-medium py-2 px-4 rounded-full transition duration-200;
}

.card {
  @apply bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden;
}

.avatar-wrapper {
  @apply relative inline-block;
}

.avatar {
  @apply rounded-full object-cover;
}

.avatar.border {
  @apply border-2 border-white;
}

.twitter-card {
  @apply bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200;
}

.trend-card {
  @apply bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer;
}

.trend-card.active {
  @apply border-twitter-blue bg-blue-50;
}

.input-twitter {
  @apply w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent;
}

.navbar {
  @apply sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between;
}

.sidebar {
  @apply fixed h-full w-64 px-4 py-6 overflow-y-auto bg-white border-r border-gray-100;
}

.main-content {
  @apply ml-64 p-6;
}

.loader {
  @apply animate-spin rounded-full h-5 w-5 border-b-2 border-twitter-blue;
}

.tooltip {
  @apply invisible absolute;
}

.has-tooltip:hover .tooltip {
  @apply visible z-50;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-medium;
}

.status-completed {
  @apply bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium;
}

.status-failed {
  @apply bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs font-medium;
}

/* Media Queries */
@media (max-width: 768px) {
  .sidebar {
    @apply hidden;
  }
  
  .main-content {
    @apply ml-0;
  }
}
```

## Step 4: Update Index.ejs

Replace the content of `views/index.ejs` with the following:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trend Avatar App</title>
  <link rel="stylesheet" href="/css/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="navbar mb-8">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        <h1 class="ml-3 text-xl font-bold text-gray-900">Trend Avatar</h1>
      </div>
      <% if (user) { %>
        <div class="flex items-center gap-4">
          <div class="avatar-wrapper">
            <img src="<%= user.profileImageUrl %>" alt="<%= user.username %>" class="avatar w-10 h-10">
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium text-gray-900">@<%= user.username %></p>
          </div>
          <div class="flex gap-2">
            <a href="/dashboard" class="btn-twitter-outline">Dashboard</a>
            <a href="/auth/logout" class="btn-twitter-secondary">Logout</a>
          </div>
        </div>
      <% } %>
    </nav>
    
    <main>
      <section class="mb-16 text-center">
        <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Make Yourself Part of the Trend
        </h2>
        <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
          Connect your X account to automatically create personalized content based on what's trending.
        </p>
        
        <% if (user) { %>
          <div class="mt-12 twitter-card max-w-md mx-auto">
            <div class="flex items-center gap-4">
              <img src="<%= user.profileImageUrl %>" alt="<%= user.username %>" class="avatar w-16 h-16">
              <div class="flex-1">
                <p class="font-medium text-gray-900">@<%= user.username %></p>
                <p class="text-gray-500 text-sm">Authenticated with X</p>
              </div>
            </div>
            <div class="mt-6 flex gap-4 justify-center">
              <a href="/dashboard" class="btn-twitter">Go to Dashboard</a>
              <a href="/auth/logout" class="btn-twitter-outline">Logout</a>
            </div>
          </div>
        <% } else { %>
          <div class="mt-12">
            <a href="/auth/login" class="btn-twitter inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Connect with X
            </a>
          </div>
        <% } %>
      </section>
      
      <section class="mb-16">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="twitter-card p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-twitter-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Personalized Trends</h3>
            <p class="text-gray-500">Our AI analyzes trends personalized to your X account and finds the most engaging content.</p>
          </div>
          
          <div class="twitter-card p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-twitter-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Avatar Swap</h3>
            <p class="text-gray-500">We swap your profile image into trending memes and images, making you part of the conversation.</p>
          </div>
          
          <div class="twitter-card p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-twitter-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Auto Posting</h3>
            <p class="text-gray-500">Automatically post the content with clever captions to your X account and join the trending conversation.</p>
          </div>
        </div>
      </section>
      
      <section class="mb-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl overflow-hidden">
        <div class="px-8 py-16 md:px-16 flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-3xl font-bold text-white mb-4">How It Works</h2>
            <ol class="text-white space-y-4 list-decimal list-inside">
              <li>Connect your X account</li>
              <li>Our AI analyzes your personalized trends</li>
              <li>We identify media that's trending in your network</li>
              <li>Replace subjects in media with your profile picture</li>
              <li>Post the personalized content with an engaging caption</li>
            </ol>
          </div>
          <div class="md:w-1/2">
            <div class="twitter-card transform rotate-3">
              <div class="flex items-center gap-3 mb-4">
                <div class="avatar-wrapper">
                  <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
                <div>
                  <p class="font-medium">@username</p>
                  <p class="text-gray-500 text-sm">2h</p>
                </div>
              </div>
              <p class="mb-4">Look at me joining the trending conversation! 😎 #TrendingNow</p>
              <div class="w-full h-48 bg-gray-200 rounded-xl"></div>
              <div class="flex items-center gap-6 mt-4 text-gray-500">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>42</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>28</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>93</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <footer class="py-8 border-t border-gray-200">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-500 text-sm">&copy; 2023 Trend Avatar App. Not affiliated with X.</p>
        <div class="flex gap-4 mt-4 md:mt-0">
          <a href="#" class="text-gray-500 hover:text-twitter-blue">
            <span class="sr-only">GitHub</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
            </svg>
          </a>
          <a href="#" class="text-gray-500 hover:text-twitter-blue">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>
```

## Step 5: Update Dashboard.ejs

Replace the content of `views/dashboard.ejs` with the following:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Trend Avatar App</title>
  <link rel="stylesheet" href="/css/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="sidebar w-64 flex flex-col">
        <div class="flex items-center px-4 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <h1 class="ml-3 text-lg font-bold text-gray-900">Trend Avatar</h1>
        </div>
        
        <nav class="flex-1 space-y-2 px-2">
          <a href="/dashboard" class="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-twitter-blue">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a href="#" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trends
          </a>
          <a href="#" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Media
          </a>
          <a href="#" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Settings
          </a>
        </nav>
        
        <div class="border-t border-gray-200 py-4 px-4">
          <div class="flex items-center space-x-3">
            <img src="<%= user.profileImageUrl %>" alt="<%= user.username %>" class="avatar w-10 h-10">
            <div>
              <p class="text-sm font-medium text-gray-900">@<%= user.username %></p>
              <a href="/auth/logout" class="text-sm text-gray-500 hover:text-twitter-blue">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile header -->
    <div class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 md:hidden">
      <div class="flex items-center justify-between h-16 px-4">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-twitter-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <h1 class="ml-3 text-lg font-bold text-gray-900">Trend Avatar</h1>
        </div>
        
        <div>
          <img src="<%= user.profileImageUrl %>" alt="<%= user.username %>" class="avatar w-8 h-8">
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col md:ml-64 pt-16 md:pt-0">
      <main class="flex-1 p-4 md:p-6">
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Trend Dashboard</h1>
          
          <div class="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <button id="refreshTrends" class="btn-twitter-outline flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Trends
            </button>
            <button id="autoProcess" class="btn-twitter flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto-Process Trend
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Trends List -->
          <div class="card">
            <div class="p-4 border-b border-gray-100">
              <h2 class="text-lg font-medium text-gray-900">Your Personalized Trends</h2>
            </div>
            <div id="trendsContainer" class="p-4 space-y-2 max-h-[500px] overflow-y-auto">
              <div class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          <!-- Media Preview -->
          <div class="lg:col-span-2 card">
            <div class="p-4 border-b border-gray-100">
              <h2 class="text-lg font-medium text-gray-900">Media Preview</h2>
            </div>
            <div id="mediaPreview" class="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-500">Select a trend to preview media</p>
            </div>
          </div>
        </div>
        
        <!-- Process Result -->
        <div id="processResult" class="mt-6 card hidden">
          <div class="p-4 border-b border-gray-100">
            <h2 class="text-lg font-medium text-gray-900">Ready to Post</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex justify-center">
                <div class="relative w-full max-w-md">
                  <img id="resultImage" src="" alt="Processed Image" class="w-full rounded-lg shadow-md">
                </div>
              </div>
              <div>
                <label for="caption" class="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <textarea id="caption" rows="4" class="input-twitter resize-none" placeholder="Your post caption"></textarea>
                
                <div class="mt-6 flex">
                  <button id="postToX" class="btn-twitter w-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Post to X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer class="py-4 px-6 border-t border-gray-200">
        <p class="text-center text-gray-500 text-sm">&copy; 2023 Trend Avatar App. Not affiliated with X.</p>
      </footer>
    </div>
  </div>
  
  <script>
    // Main JavaScript for dashboard functionality
    document.addEventListener('DOMContentLoaded', function() {
      // DOM elements
      const trendsContainer = document.getElementById('trendsContainer');
      const mediaPreview = document.getElementById('mediaPreview');
      const refreshTrendsBtn = document.getElementById('refreshTrends');
      const autoProcessBtn = document.getElementById('autoProcess');
      const processResult = document.getElementById('processResult');
      const resultImage = document.getElementById('resultImage');
      const captionTextarea = document.getElementById('caption');
      const postToXBtn = document.getElementById('postToX');
      
      // Fetch personalized trends
      async function fetchTrends() {
        trendsContainer.innerHTML = `
          <div class="animate-pulse space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
          <div class="animate-pulse space-y-3 mt-4">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
          <div class="animate-pulse space-y-3 mt-4">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        `;
        
        try {
          const response = await fetch('/api/trends');
          const data = await response.json();
          
          if (!data.trends || data.trends.length === 0) {
            trendsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No trends found. Try refreshing later.</p>';
            return;
          }
          
          renderTrends(data.trends);
        } catch (error) {
          console.error('Error fetching trends:', error);
          trendsContainer.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load trends. Please try again.</p>';
        }
      }
      
      // Render trends list
      function renderTrends(trends) {
        trendsContainer.innerHTML = '';
        
        trends.forEach(trend => {
          const trendItem = document.createElement('div');
          trendItem.className = 'trend-card mb-3';
          trendItem.dataset.trendName = trend.trend_name;
          
          const trendContent = `
            <div class="trend-name font-medium text-twitter-blue">${trend.trend_name}</div>
            <div class="flex justify-between text-sm text-gray-500 mt-1">
              <span>${trend.post_count} posts</span>
              <span>${trend.category || 'Uncategorized'}</span>
            </div>
          `;
          
          trendItem.innerHTML = trendContent;
          
          trendItem.addEventListener('click', () => {
            // Remove selected class from all trends
            document.querySelectorAll('.trend-card').forEach(item => {
              item.classList.remove('active');
            });
            
            // Add selected class to clicked trend
            trendItem.classList.add('active');
            
            // Analyze the selected trend
            analyzeTrend(trend.trend_name);
          });
          
          trendsContainer.appendChild(trendItem);
        });
      }
      
      // Analyze a selected trend
      async function analyzeTrend(trendName) {
        mediaPreview.innerHTML = `
          <div class="flex flex-col items-center justify-center">
            <div class="loader mb-4"></div>
            <p class="text-gray-500">Analyzing trend...</p>
          </div>
        `;
        
        try {
          const response = await fetch(`/api/trends/analyze/${encodeURIComponent(trendName)}`);
          const data = await response.json();
          
          if (!data.analysis) {
            mediaPreview.innerHTML = '<p class="text-gray-500">No analysis available for this trend.</p>';
            return;
          }
          
          const analysis = data.analysis;
          
          // Render media preview and analysis
          let previewContent = '';
          
          if (analysis.processingSuitability >= 50 && analysis.mediaItems.length > 0) {
            const firstMedia = analysis.mediaItems[0];
            previewContent = `
              <div class="flex flex-col items-center">
                <img src="${firstMedia.mediaUrl}" alt="Trend media" class="w-full max-w-md rounded-lg shadow-md mb-6" />
                <div class="w-full max-w-md">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Analysis</h3>
                  <p class="text-gray-600 mb-3">${analysis.thematicDescription}</p>
                  <div class="mb-4">
                    <div class="flex items-center">
                      <span class="text-sm font-medium text-gray-700 mr-2">Suitability score:</span>
                      <div class="bg-gray-200 h-2.5 rounded-full w-full max-w-xs">
                        <div class="bg-twitter-blue h-2.5 rounded-full" style="width: ${analysis.processingSuitability}%"></div>
                      </div>
                      <span class="text-sm font-medium text-gray-700 ml-2">${analysis.processingSuitability}/100</span>
                    </div>
                  </div>
                  <button class="btn-twitter w-full" onclick="processMedia('${trendName}')">
                    Process This Media
                  </button>
                </div>
              </div>
            `;
          } else if (analysis.mediaItems.length > 0) {
            const firstMedia = analysis.mediaItems[0];
            previewContent = `
              <div class="flex flex-col items-center">
                <img src="${firstMedia.mediaUrl}" alt="Trend media" class="w-full max-w-md rounded-lg shadow-md mb-6" />
                <div class="w-full max-w-md">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Analysis</h3>
                  <p class="text-gray-600 mb-3">${analysis.thematicDescription}</p>
                  <div class="mb-4">
                    <div class="flex items-center">
                      <span class="text-sm font-medium text-gray-700 mr-2">Suitability score:</span>
                      <div class="bg-gray-200 h-2.5 rounded-full w-full max-w-xs">
                        <div class="bg-red-500 h-2.5 rounded-full" style="width: ${analysis.processingSuitability}%"></div>
                      </div>
                      <span class="text-sm font-medium text-gray-700 ml-2">${analysis.processingSuitability}/100</span>
                    </div>
                  </div>
                  <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p>This trend is not suitable for avatar swapping.</p>
                  </div>
                </div>
              </div>
            `;
          } else {
            previewContent = `
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Analysis</h3>
                <p class="text-gray-600 mb-3">${analysis.thematicDescription}</p>
                <p class="text-gray-500">No media found for this trend.</p>
              </div>
            `;
          }
          
          mediaPreview.innerHTML = previewContent;
        } catch (error) {
          console.error('Error analyzing trend:', error);
          mediaPreview.innerHTML = '<p class="text-red-500 text-center">Failed to analyze trend. Please try again.</p>';
        }
      }
      
      // Process media for a trend
      window.processMedia = async function(trendName) {
        mediaPreview.innerHTML = `
          <div class="flex flex-col items-center justify-center">
            <div class="loader mb-4"></div>
            <p class="text-gray-500">Processing media...</p>
          </div>
        `;
        
        try {
          const response = await fetch(`/api/trends/process/${encodeURIComponent(trendName)}`, {
            method: 'POST',
          });
          
          const data = await response.json();
          
          if (data.error) {
            mediaPreview.innerHTML = `
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-red-500">${data.error}</p>
              </div>
            `;
            return;
          }
          
          if (!data.result) {
            mediaPreview.innerHTML = '<p class="text-red-500 text-center">Failed to process media.</p>';
            return;
          }
          
          // Show the processed result
          resultImage.src = data.result.modifiedMediaUrl;
          captionTextarea.value = data.result.caption;
          processResult.classList.remove('hidden');
          
          // Update media preview
          mediaPreview.innerHTML = `
            <div class="flex flex-col items-center">
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 w-full max-w-md">
                <p class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Media successfully processed!
                </p>
              </div>
              <p class="text-gray-500">Scroll down to see the result and post to X.</p>
            </div>
          `;
          
          // Scroll to the result
          processResult.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
          console.error('Error processing media:', error);
          mediaPreview.innerHTML = '<p class="text-red-500 text-center">Failed to process media. Please try again.</p>';
        }
      };
      
      // Auto-process trend
      async function autoProcessTrend() {
        mediaPreview.innerHTML = `
          <div class="flex flex-col items-center justify-center">
            <div class="loader mb-4"></div>
            <p class="text-gray-500">Auto-processing trends...</p>
          </div>
        `;
        processResult.classList.add('hidden');
        
        try {
          const response = await fetch('/api/trends/auto-process', {
            method: 'POST',
          });
          
          const data = await response.json();
          
          if (data.error) {
            mediaPreview.innerHTML = `
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-red-500">${data.error}</p>
              </div>
            `;
            return;
          }
          
          if (data.message) {
            mediaPreview.innerHTML = `
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-700">${data.message}</p>
              </div>
            `;
            return;
          }
          
          if (data.success) {
            mediaPreview.innerHTML = `
              <div class="flex flex-col items-center">
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 w-full max-w-md">
                  <p class="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Auto-Processing Complete!
                  </p>
                  <p class="text-sm">Successfully posted using trend: <span class="font-medium">${data.trendUsed}</span></p>
                </div>
                <div class="twitter-card w-full max-w-md">
                  <div class="flex items-center gap-3 mb-4">
                    <img src="<%= user.profileImageUrl %>" alt="<%= user.username %>" class="avatar w-10 h-10">
                    <div>
                      <p class="font-medium">@<%= user.username %></p>
                      <p class="text-gray-500 text-sm">Just now</p>
                    </div>
                  </div>
                  <p class="mb-4">${data.caption}</p>
                  <p class="text-twitter-blue hover:underline">
                    <a href="${data.tweetUrl}" target="_blank">View on X</a>
                  </p>
                </div>
              </div>
            `;
          } else {
            mediaPreview.innerHTML = '<p class="text-red-500 text-center">Failed to auto-process trends.</p>';
          }
        } catch (error) {
          console.error('Error auto-processing trend:', error);
          mediaPreview.innerHTML = '<p class="text-red-500 text-center">Failed to auto-process trends. Please try again.</p>';
        }
      }
      
      // Post to X
      async function postToX() {
        if (!captionTextarea.value || !resultImage.src) {
          alert('Caption and image are required.');
          return;
        }
        
        // Disable button and show loading
        postToXBtn.disabled = true;
        postToXBtn.innerHTML = `
          <div class="loader mr-2"></div>
          <span>Posting...</span>
        `;
        
        try {
          const response = await fetch('/api/trends/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              caption: captionTextarea.value,
              mediaUrl: resultImage.src,
            }),
          });
          
          const data = await response.json();
          
          // Reset button
          postToXBtn.disabled = false;
          postToXBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Post to X
          `;
          
          if (data.error) {
            alert(`Error: ${data.error}`);
            return;
          }
          
          if (data.success) {
            processResult.classList.add('hidden');
            mediaPreview.innerHTML = `
              <div class="flex flex-col items-center">
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 w-full max-w-md">
                  <p class="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Posted Successfully!
                  </p>
                  <p class="text-sm">Your post is now live on X.</p>
                </div>
                <div class="twitter-card w-full max-w-md">
                  <div class="flex items-center gap-3 mb-4">
                    <img src="<%= user.profileImageUrl %>" alt="<%= user.username %>" class="avatar w-10 h-10">
                    <div>
                      <p class="font-medium">@<%= user.username %></p>
                      <p class="text-gray-500 text-sm">Just now</p>
                    </div>
                  </div>
                  <p class="mb-4">${captionTextarea.value}</p>
                  <div class="mb-4">
                    <img src="${resultImage.src}" alt="Posted image" class="w-full rounded-lg">
                  </div>
                  <p class="text-twitter-blue hover:underline">
                    <a href="${data.tweetUrl}" target="_blank">View on X</a>
                  </p>
                </div>
              </div>
            `;
          } else {
            alert('Failed to post to X.');
          }
        } catch (error) {
          console.error('Error posting to X:', error);
          alert('Failed to post to X. Please try again.');
          
          // Reset button
          postToXBtn.disabled = false;
          postToXBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Post to X
          `;
        }
      }
      
      // Event listeners
      refreshTrendsBtn.addEventListener('click', fetchTrends);
      autoProcessBtn.addEventListener('click', autoProcessTrend);
      postToXBtn.addEventListener('click', postToX);
      
      // Initial fetch
      fetchTrends();
    });
  </script>
</body>
</html>
```

## Step 6: Update package.json

Update your package.json to include the necessary scripts for running Tailwind CSS:

```json
"scripts": {
  "start": "node dist/app.js",
  "dev": "concurrently \"npx tailwindcss -i ./public/css/style.css -o ./public/css/tailwind.css --watch\" \"ts-node src/app.ts\"",
  "build": "npx tailwindcss -i ./public/css/style.css -o ./public/css/tailwind.css && tsc",
  "postinstall": "npm run build"
}
```

Also, install concurrently:

```bash
npm install --save-dev concurrently
```

## Step 7: Create Public Directories

Make sure you have the necessary public directories set up:

```bash
mkdir -p public/uploads
mkdir -p public/images
```

## Step 8: Update App.ts to Include Tailwind CSS

Modify your `src/app.ts` file to include references to the Tailwind CSS output file:

```typescript
// Add this after the static files middleware
app.use('/css', express.static(path.join(__dirname, '../public/css')));
```

## Final Notes

The styling from the CloneX frontend has been successfully adapted to your Trend Avatar app. The new design features:

1. A modern, clean interface with Twitter/X-inspired colors and elements
2. Responsive design that works on mobile and desktop
3. Improved trend cards, media preview, and results section
4. Loading states with nice animations
5. Better feedback for user actions
6. Proper error and success states

The implementation uses Tailwind CSS for styling, which provides a utility-first approach that's both flexible and maintainable. The design follows modern web best practices and should provide a great user experience.

To see these changes in action, run your app with:

```bash
npm run dev
```

This will compile the Tailwind CSS and start your development server.