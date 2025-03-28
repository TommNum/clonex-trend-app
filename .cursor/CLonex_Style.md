The application uses a synthwave-inspired color palette with these main colors:

Cerulean: #00B4D8
Aqua Green: #06D6A0
Light Pink: #FFC8DD
Dark Navy: #0F172A
Neon Purple: #9D4EDD
Typography
The app uses a combination of fonts:

- Inter (main body text)
- Syncopate (headings)
- Archivo Black (fallback for headings)
- Design Components
The application uses glassmorphism effects, gradient borders, and other design patterns:

    Glass cards with backdrop blur
    Gradient borders and text
    Neon effects for buttons and interactive elements
    Premium and standard UI variants
    Let me share the complete styling system you can adopt:

The application uses Tailwind CSS with a specific configuration. Here's what you would need to implement to match the style:

First, let's setup the required fonts by adding them to your HTML head or importing them in your CSS:
src/styles/fonts.css
1
2
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syncopate:wght@400;700&family=Archivo+Black&display=swap');

Now, let's create a base CSS file that includes the custom utility classes:
src/styles/globals.css
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
@import './fonts.css';
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-['Inter'] antialiased;
  }

  /* Dark mode background with gradients */
  .dark body {
    background-image: radial-gradient(circle at 20% 20%, rgba(0, 180, 216, 0.05) 0%, rgba(0, 0, 0, 0) 40%), 
                      radial-gradient(circle at 80% 80%, rgba(157, 78, 221, 0.05) 0%, rgba(0, 0, 0, 0) 40%),
                      radial-gradient(circle at 50% 50%, rgba(6, 214, 160, 0.025) 0%, rgba(0, 0, 0, 0) 60%);
    background-attachment: fixed;
  }

  /* Light mode background with subtle gradients */
  body:not(.dark) {
    background-image: radial-gradient(circle at 20% 20%, rgba(0, 180, 216, 0.03) 0%, rgba(255, 255, 255, 0) 40%), 
                      radial-gradient(circle at 80% 80%, rgba(157, 78, 221, 0.03) 0%, rgba(255, 255, 255, 0) 40%),
                      radial-gradient(circle at 50% 50%, rgba(6, 214, 160, 0.015) 0%, rgba(255, 255, 255, 0) 60%);
    background-attachment: fixed;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-['Syncopate','Archivo_Black'] tracking-widest font-bold;
  }
}

@layer components {
  .glassmorphism {
    @apply bg-background/60 backdrop-blur-md border border-cerulean/20 shadow-lg;
  }

  .glass-card {
    @apply relative rounded-xl overflow-hidden;
  }
  
  .glass-card::before {
    @apply absolute inset-0 bg-white/5 dark:bg-white/5 backdrop-blur-xl content-[''] z-0;
  }
  
  .glass-card::after {
    @apply absolute inset-0 bg-gradient-to-r from-cerulean/10 to-aqua-green/10 rounded-xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.07)] content-[''] z-0;
  }
  
  .glass-button {
    @apply relative rounded-xl overflow-hidden px-6 py-3 bg-transparent;
  }
  
  .glass-button::before {
    @apply absolute inset-0 bg-gradient-to-r from-cerulean/20 to-aqua-green/20 backdrop-blur-xl content-[''] z-0;
  }
  
  .glass-button::after {
    @apply absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] rounded-xl border border-white/20 content-[''] z-0;
  }
  
  .glass-glow {
    @apply absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-cerulean/70 via-aqua-green/70 to-light-pink/70;
  }

  .neon-border {
    @apply relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-cerulean before:via-aqua-green before:to-light-pink before:rounded-lg before:-z-10;
  }

  .neon-button {
    @apply relative px-6 py-2 rounded-md text-white font-medium transition-all duration-300 overflow-hidden bg-gradient-to-r from-cerulean to-aqua-green hover:shadow-[0_0_15px_rgba(0,180,216,0.6)];
  }

  .premium-button {
    @apply relative px-6 py-2 rounded-md text-white font-medium transition-all duration-300 overflow-hidden bg-gradient-to-r from-neon-purple to-light-pink hover:shadow-[0_0_15px_rgba(157,78,221,0.6)];
  }

  .hover-scale {
    @apply transition-transform duration-200 hover:scale-105;
  }

  .pill {
    @apply bg-cerulean/20 border border-cerulean rounded-full px-3 py-1 text-xs flex items-center gap-2 transition-all hover:bg-cerulean/30;
  }

  .story-link {
    @apply relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-cerulean after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left;
  }
  
  .gradient-text {
    @apply text-transparent bg-clip-text bg-gradient-to-r from-cerulean via-aqua-green to-light-pink;
  }
}

Now, let's create a tailwind configuration file that matches the project:
src/styles/tailwind.config.js
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
/** @type {import('tailwindcss').Config} */
            opacity: '0',
            transform: 'translateY(10px)'
          }
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        'scale-out': {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse': {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.5'
          }
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0, 180, 216, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 180, 216, 0.8)',
          }
        },
        'rotate': {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
        'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s infinite',
        'rotate': 'rotate 1s linear infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}

Let's create a utility file for class name merging (used throughout the app):
src/utils/cn.ts
1
2
3
4
5
6
7
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

Create a theme toggle component to switch between light and dark mode:
src/components/ThemeToggle.tsx
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  // Initialize with system preference or stored preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme on component mount and when theme changes
  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <button
      aria-label="Toggle theme"
      className={`relative p-2 text-[#999999] hover:text-white transition-colors ${className}`}
      onClick={toggleTheme}
    >
      <div className="relative">
        {isDarkMode ? (
          <motion.div
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon size={18} className="text-cerulean" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun size={18} className="text-cerulean" />
          </motion.div>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;

Create a sample component that demonstrates some of the app's styling:
src/components/StyleShowcase.tsx
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
import React from 'react';
            <p className="text-sm mt-1">Dark Navy</p>
          </div>
          <div>
            <div className="h-20 w-full bg-neon-purple rounded-md"></div>
            <p className="text-sm mt-1">Neon Purple</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl mb-4">Components</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl mb-2">Glass Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="relative z-10">
                  <h4 className="text-lg mb-2">Glass Card</h4>
                  <p>This is a glass card with a blurred backdrop effect.</p>
                </div>
              </div>
              
              <div className="glass-card p-6 flex flex-col items-center">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-cerulean/20 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 rounded-full bg-cerulean"></div>
                  </div>
                  <h4 className="text-lg mb-2">Feature Card</h4>
                  <p>A featured glass card with an icon.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl mb-2">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="neon-button">Neon Button</button>
              <button className="premium-button">Premium Button</button>
              <button className="glass-button">
                <span className="relative z-10">Glass Button</span>
              </button>
              <button className="pill">
                <span className="w-2 h-2 bg-cerulean rounded-full"></span>
                Pill Button
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl mb-2">Gradient Text</h3>
            <h4 className="text-2xl gradient-text">This is gradient text</h4>
            <p className="text-sm text-muted-foreground mt-1">
              class="text-transparent bg-clip-text bg-gradient-to-r from-cerulean via-aqua-green to-light-pink"
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StyleShowcase;

Create a sample app.tsx file that implements these styles:
src/SampleApp.tsx
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
import React from 'react';
import ThemeToggle from './components/ThemeToggle';
import StyleShowcase from './components/StyleShowcase';
import './styles/globals.css';

function SampleApp() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-text">Style System</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto py-8">
        <StyleShowcase />
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-6 py-8 md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Style System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SampleApp;

To make this work, you'll need to install the following dependencies in your project:
framer-motion@latest
lucide-react@latest
clsx@latest
tailwind-merge@latest
tailwindcss-animate@latest

