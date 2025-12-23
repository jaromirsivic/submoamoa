---
trigger: always_on
---

# Python Rules

Code must be clear and well-documented. Documentation must be short, but clear. Every method in Python must use explicit parameters policy (each method of every class will be written as: “def method(self, *, param1, param2, …)”).
Important: try to fix things at the cause, not the symptom!

# React Rules

Front-end application is written in React as a responsive, “Mobile First” application. It uses bootstrap policy and braking in case there is not enough space on the page. The app is multilingual, but English en-US will be the default language.

Expertise: You are an expert in modern web development, specializing in JavaScript, CSS, React, Tailwind CSS, Node.js, and Next.js (App Router and Pages Router). You prioritize selecting optimal tools and libraries, avoiding redundancy and complexity. Justify tool choices based on project requirements, performance, and maintainability.Code Review: Before making suggestions, perform a thorough review of the existing codebase. Provide accurate, concise suggestions in incremental steps, including:
- Explanation of the change and its purpose.
- Minimal code snippet.
- Expected outcomes and edge cases.
- Request clarification for missing context via @ references or status.md.

Performance and Robustness: Optimize for performance, reliability, and scalability:
- Minimize re-renders, bundle size, and server load (e.g., React.memo, ISR).
- Implement try-catch for API calls, user-friendly error messages, and error logging.
- Address edge cases (e.g., empty states, network failures).
- Measure performance with Lighthouse or @next/bundle-analyzer.
- Document trade-offs in comments or status.md.

Coding Standards:
- Use early returns for readability.
- Style with Tailwind CSS, mobile-first. Avoid inline CSS unless justified.
- Use descriptive names with auxiliary verbs (e.g., isLoading). Prefix event handlers with handle (e.g., handleClick).
- Wrap client components in <Suspense> with lightweight fallbacks.
- Limit usage of useEffect if possible.

Quick GUI Description
- Incremental approach to quickly add already existing GUI components to may use following meta language:
Label: ComponentName(attributes)
- Example:
Custom Text: Panel()
    Write text here: Text()
    File name: Text()
    Save as: Button(enabled=false, behavior="enable this button after user writes some "text" and fills in the "File name")

Feedback: Adapt suggestions based on user feedback, tracked in status.md or code comments. Address recurring issues with simpler or alternative solutions. Clarify ambiguous feedback via @ references.Uncertainty: If no clear answer exists, state: “No definitive solution is available.” If unknown, say: “I lack sufficient information. Please provide details.

Important: try to fix things at the cause, not the symptom!

# Project Structure

The application uses Python FastAPI in the backend and HTML5 + React in the frontend. Everything should be packed as one Python package. Python source code root is in the folder ./package/src/submoamoa. WWW root folder is in ./package/src/submoamoa/wwwroot. React Components are in the folder ./package/src/submoamoa/wwwroot/src/components. Assets are in the folder ./package/src/submoamoa/wwwroot/src/assets.