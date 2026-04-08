## Calendar 📅

A modern calendar built with React + Vite that shows each month with a flip animation and a side panel to add events/notes (including recurring events). Events are saved in the browser using `localStorage`.

## Features

- **Monthly calendar view** with smooth **flip animation** (Framer Motion)
- **Month header image** (different image for each month)
- **Day selection**
  - Click a day to select it
  - Shift + click to select a range (highlight only)
- **Events & Notes panel (right side) 📝**
  - Click **+** to open a dropdown composer
  - Add **start/end date**, **title**, **notes**
  - **Edit** and **delete** existing events
- **Recurring events ⏱️** 
  - Repeat: **Daily / Weekly / Monthly**
  - Choose **Repeat Until** date
- **Event indicator on calendar ⭐️**
  - A small **★ star** appears next to dates that have events
- **Persistent storage**
  - Events are stored in `localStorage` under key: `calendarEvents:v1`
- **Responsive 📱💻**
  - Desktop: calendar + events side-by-side
  - Mobile: stacks vertically for better fit

## Tech Stack

- React
- Vite
- date-fns
- Framer Motion

## 🚀 Run Locally

Follow these steps to run the project on your machine:

### 1. Clone the repository

```bash
git clone https://github.com/Aashka19/Calender.git
cd Calender
```
### 2. Install dependencies
```bash
npm install
```
### 3. Start the development server
```bash
npm run dev
```
### 4. Open in browser
Go to:
http://localhost:5173 ↗


