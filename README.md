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


