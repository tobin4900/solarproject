# Canvas Editor

A lightweight, web-based canvas editor built with React, Fabric.js, and Firebase Firestore. This application allows users to create and edit 2D designs with shapes, text, and a pen tool, and share their work via public links without requiring a login. The editor is designed to be intuitive, stateless, and shareable, providing a "mini Canva" experience.

## Features

- **Canvas Editor**:
  - Add and manipulate rectangles, circles, text, and freehand drawings using a pen tool.
  - Move, resize, rotate, and delete objects on the canvas.
  - Edit text content and change colors of selected objects.
- **Stateless Scene Management**:
  - Generates a unique scene ID on visiting the homepage (`/`), redirecting to `/canvas/:id`.
  - Persists canvas state in Firebase Firestore with auto-saving (debounced to reduce writes).
  - Loads canvas state when accessing `/canvas/:id`.
- **Shareability**:
  - Share canvas via a public link with a "Share Canvas" button.
  - Anyone with the link can view or edit the canvas without authentication.
- **Bonus Features**:
  - **Undo/Redo**: Supports reversing and reapplying recent actions using an undo/redo stack.
  - **Export**: Export the canvas as PNG or SVG formats.
  - **View-Only Mode**: Load the canvas in read-only mode via `?viewOnly=true` query parameter.

## Tech Stack

- **React**: For building the user interface and managing component state.
- **Fabric.js**: For canvas rendering and object manipulation.
- **Firebase Firestore**: For persistent storage of canvas states.
- **Tailwind CSS**: For styling the UI with utility-first classes.
- **Vite**: For fast development and optimized builds.
- **TypeScript**: For type safety and improved developer experience.

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PraveenKumar22C/canvas-snap
   cd canvas-snap
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore and obtain your Firebase configuration.
   - Update `src/lib/firebase.ts` with your Firebase configuration:
 
     const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-auth-domain",
       projectId: "your-project-id",
       storageBucket: "your-storage-bucket",
       messagingSenderId: "your-messaging-sender-id",
       appId: "your-app-id"
     };

4. **Run the Development Server**:
   The app will be available at `http://localhost:8080`.

5. **Build for Production**:
   npm run build

6. **Deploy**:
   - Deploy to Firebase Hosting, Vercel, or any platform of your choice. For Firebase:
     npm install -g firebase-tools
     firebase login
     firebase init hosting
     firebase deploy

## Trade-Offs

- **Debounced Auto-Save**: Firestore writes are debounced (1-second delay) to reduce write frequency, balancing performance and data consistency. This introduces a slight delay in saving but minimizes costs and improves scalability.
- **Undo/Redo Implementation**: Uses a state stack (limited to 20 states) to manage undo/redo operations. While memory-efficient, it may not handle extremely complex canvases with many objects. A more robust solution could involve diff-based state management but was avoided for simplicity.
- **View-Only Mode**: Implemented via a query parameter (`?viewOnly=true`), which disables editing tools and canvas interactions. This approach is simple but relies on client-side enforcement, which could be bypassed. Server-side validation was not implemented as it requires authentication, which was outside the scope.
- **Export Functionality**: Supports PNG and SVG exports. PNG uses a multiplier for higher resolution, but large canvases may result in large file sizes. SVG export is lightweight but may not perfectly preserve all Fabric.js features due to format limitations.
- **Stateless Design**: The app avoids user authentication to simplify the experience, but this means anyone with the link can edit the canvas. This aligns with the "no login" requirement but sacrifices access control.

## Bonus Features Implemented

- **Undo/Redo**: Tracks canvas state changes in memory, allowing users to undo or redo actions. States are stored as JSON strings, with a limit of 20 to prevent excessive memory usage.
- **Export**: Users can export the canvas as PNG or SVG via a dropdown menu, providing flexibility for different use cases.
- **View-Only Mode**: Enabled through a query parameter, allowing users to share a read-only version of the canvas. A "Copy View Link" button generates the appropriate URL.

## Future Improvements

- **Snap to Grid**: Implement visual snapping for precise shape alignment.
- **Object Locking**: Allow users to lock objects to prevent accidental edits.
- **Templates**: Provide pre-designed canvas templates for quick starts.
- **Optimizations**: Further optimize Firestore writes by batching updates or using delta encoding.
- **Accessibility**: Improve keyboard navigation and screen reader support for better usability.

## Github Repo
[https://github.com/PraveenKumar22C/canvas-snap](https://solar-ladder-editor.web.app/)

## Live Demo

https://canvas-editor-c2de6.web.app/
https://canvas-editor-c2de6.firebaseapp.com/

## Video Walkthrough

https://drive.google.com/file/d/1tbJ2bW6wWbACzdMnvCSQUQlYLwI1Td9w/view?usp=drive_link
