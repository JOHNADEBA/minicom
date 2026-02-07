# MiniCom – Real-Time Chat Interview Exercise

MiniCom is a **real-time chat application** built as part of a technical interview exercise.
It demonstrates frontend architecture, real-time messaging concepts, state management, resilience patterns, and UI/UX decisions using modern React tooling.

The project intentionally focuses on **clarity, correctness, and maintainability** rather than backend complexity.

---

## ✨ Features

### Core Chat

- Visitor ↔ Agent real-time messaging
- Thread-based conversations
- Agent inbox with unread counts
- Message ordering by timestamp
- Optimistic UI updates

### Message States

- `sending`
- `sent`
- `delivered`
- `read`
- `failed`

> Only the **latest message sent by the current user** shows a delivery status (similar to real chat apps).

---

## 🔁 Real-Time & Resilience

- Real-time simulation via **BroadcastChannel**
- Delivery acknowledgements:
  - sent → delivered → read

- Typing indicators (visitor / agent)
- Offline detection with banner
- Failed message handling with **manual retry**
- Offline message queue persisted in `localStorage`

**Design decision:**
Failed messages are **not automatically retried on page refresh** to avoid accidental duplicate sends. Retry is explicit and user-controlled.

---

## 🧠 Architecture & Design Decisions

### State Management

- **Zustand** for global chat state
- Messages normalized by `threadId`
- Derived UI state (unread counts, typing indicators, last-message status)

### Persistence

- Messages and offline queue stored in `localStorage`
- State sanitized on load to prevent invalid delivery states

### Role Awareness

- Role (`visitor` / `agent`) inferred from route
- Delivery & read receipts applied **only on sender side**
- Receiver never stores message status

---

## 🎨 UI / UX

- Responsive layout using **Tailwind CSS**
- Floating visitor chat widget
- Agent inbox + conversation view
- Auto-scroll message list (with lazy loading for long histories)
- Retry button for failed messages
- Offline banner when network is unavailable

---

## 🌙 Theme Support

- Light / Dark mode toggle
- Theme persisted across sessions
- Applied globally via `<html class="dark">`

---

## 🧪 Testing

Minimum required tests are implemented:

### 1. UI Interaction

- Sending a message via keyboard (`Enter`)

### 2. State Transitions

- Message ordering by `createdAt`
- Message status updates (`sending → delivered`)

### 3. Edge Case

- Failed message retry flow

**Tools used**

- Vitest
- @testing-library/react

---

## 🛠️ Tech Stack

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Zustand**
- **Tailwind CSS**
- **Vitest**
- **BroadcastChannel API**

---

## 📦 Import Order Convention

All files follow a consistent import hierarchy for readability and maintainability:

1. **React / Next.js**
2. **Third-party libraries**
3. **`lib/`**
4. **`hooks/`**
5. **`components/`**
6. **Local files**

Example:

```ts
import { useState, useEffect } from "react";

import debounce from "lodash.debounce";

import { deliver } from "@/lib/realtime";
import { useOnline } from "@/hooks/useOnline";
import { MessageList } from "@/components/shared/MessageList";
```

---

## 📂 Project Structure (Simplified)

```
src/
├─ app/
│  ├─ agent/          # Agent inbox + threads
│  ├─ visitor/        # Visitor chat widget
│  ├─ not-found.tsx   # 404 page
│
├─ components/
│  ├─ agent/
│  ├─ visitor/
│  ├─ shared/
│  ├─ ui/
│
├─ hooks/
│  ├─ useOnline.ts
│  ├─ useTyping.ts
│
├─ store/
│  └─ chatStore.ts
│
├─ lib/
│  ├─ realtime.ts
│  ├─ models.ts
│  ├─ theme.ts
│  ├─ persist.ts
│
├─ tests/
│  ├─ chatStore.test.ts
│  ├─ chatWidget.test.tsx
│  └─ retry.test.ts
```

---

## ▶️ Running the App Locally

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:3000
```

### Run tests

```bash
npm run test
```

---

## 🚀 Deployment (Vercel)

This project is deployed on **Vercel**.

To deploy your own version:

1. Push the repository to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import the repository
4. Use default Next.js settings
5. Deploy

No additional configuration is required.

---

## 🚫 Intentionally Out of Scope

The following were deliberately excluded to keep the exercise focused:

- Backend / database
- Authentication
- WebSockets or server infrastructure
- Push notifications
- Automatic retry on refresh
- CI pipelines or git hooks

---

## 📝 Notes for Reviewers

- Emphasis is on **correctness, resilience, and clean architecture**
- Hydration safety and SSR edge cases were explicitly handled
- UI behavior mirrors real-world chat applications
- Code favors readability over unnecessary abstraction

---

## ✅ Summary

This project demonstrates:

- Real-time messaging logic
- State consistency under failure
- Clean React + Zustand architecture
- Thoughtful UX decisions
- Testable, maintainable code
