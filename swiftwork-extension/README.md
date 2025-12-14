# swiftwork-extension

AI-powered Chrome Extension for Fastwork optimization.

## Features

- **AI-Powered Optimization**: Enhances your Fastwork experience using AI.
- **Chrome Extension**: Built as a standard Chrome Extension with background scripts, content scripts, and popup/options UI.
- **Modern Tech Stack**: Developed using React, TypeScript, and Vite for a fast and robust development experience.

## Tech Stack

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd swiftwork-extension
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Development

### Running in Development Mode

To start the development server:

```bash
npm run dev
```

To run the build in watch mode (rebuilds on file changes):

```bash
npm run watch
```

### Building for Production

To create a production build:

```bash
npm run build
```

### Loading the Extension in Chrome

1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable "Developer mode" in the top right corner.
3.  Click "Load unpacked".
4.  Select the `dist` folder in your project directory.
