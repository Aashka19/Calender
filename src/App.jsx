 import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  addDays,
  addWeeks,
  addYears,
  addMonths as addMonthsInterval,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import jan from "./assets/jan.jpg";
import feb from "./assets/feb.jpg";
import mar from "./assets/mar.jpg";
import apr from "./assets/apr.jpg";
import may from "./assets/may.jpg";
import jun from "./assets/jun.jpg";
import jul from "./assets/jul.jpg";
import aug from "./assets/aug.jpg";
import sep from "./assets/sep.jpg";
import oct from "./assets/oct.jpg";
import nov from "./assets/nov.jpg";
import dec from "./assets/dec.jpg";

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(1);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStart, setComposerStart] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [composerEnd, setComposerEnd] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [composerRepeat, setComposerRepeat] = useState("none"); // none | daily | weekly | monthly
  const [composerRepeatUntil, setComposerRepeatUntil] = useState(() =>
    format(addYears(new Date(), 1), "yyyy-MM-dd")
  );
  const [editingEventId, setEditingEventId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem("calendarEvents:v1");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const persistEvents = (next) => {
    setEvents(next);
    try {
      localStorage.setItem("calendarEvents:v1", JSON.stringify(next));
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  };

  // Days logic
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const startDay = getDay(startOfMonth(currentDate));
  const emptyDays = Array.from({ length: startDay });

  // Images for each month
   const monthImages = {
      0: jan,
      1: feb,
      2: mar,
      3: apr,
      4: may,
      5: jun,
      6: jul,
      7: aug,
      8: sep,
      9: oct,
      10: nov,
      11: dec,
    };
  const currentMonth = currentDate.getMonth();
  const imageUrl = monthImages[currentMonth];

  const normalizedSelection =
    selectionStart && selectionEnd
      ? selectionStart <= selectionEnd
        ? { start: selectionStart, end: selectionEnd }
        : { start: selectionEnd, end: selectionStart }
      : null;

  const selectionLabel = normalizedSelection
    ? isSameDay(normalizedSelection.start, normalizedSelection.end)
      ? format(normalizedSelection.start, "EEE, d MMM yyyy")
      : `${format(normalizedSelection.start, "d MMM yyyy")} – ${format(
          normalizedSelection.end,
          "d MMM yyyy"
        )}`
    : "No day selected";

  const isDaySelected = (day) => {
    if (!normalizedSelection) return false;
    return isWithinInterval(day, {
      start: startOfDay(normalizedSelection.start),
      end: endOfDay(normalizedSelection.end),
    });
  };

  const isDaySelectionEdge = (day) => {
    if (!normalizedSelection) return false;
    return (
      isSameDay(day, normalizedSelection.start) ||
      isSameDay(day, normalizedSelection.end)
    );
  };

  const dayHasAnyEvent = (day) => {
    const d = startOfDay(day);
    const matchesNonRecurring = (ev, date) => {
      const start = startOfDay(new Date(ev.start));
      const end = endOfDay(new Date(ev.end));
      return isWithinInterval(date, { start, end });
    };

    const matchesRecurring = (ev, date) => {
      const repeat = ev.repeat || "none";
      if (repeat === "none") return false;

      const baseStart = startOfDay(new Date(ev.start));
      const baseEnd = startOfDay(new Date(ev.end));
      const durationDays = Math.max(
        0,
        Math.round((baseEnd.getTime() - baseStart.getTime()) / 86400000)
      );

      const until = ev.repeatUntil
        ? endOfDay(new Date(ev.repeatUntil))
        : endOfDay(addYears(baseStart, 1));

      if (date < baseStart || date > until) return false;

      const addFn =
        repeat === "daily"
          ? (d, n) => addDays(d, n)
          : repeat === "weekly"
            ? (d, n) => addWeeks(d, n)
            : (d, n) => addMonthsInterval(d, n);

      // Iterate occurrences safely until we pass the date or until.
      let occStart = baseStart;
      let guard = 0;
      while (occStart <= until && guard < 3000) {
        const occEnd = endOfDay(addDays(occStart, durationDays));
        if (isWithinInterval(date, { start: occStart, end: occEnd })) return true;
        if (occStart > date) return false;
        occStart = addFn(occStart, 1);
        guard += 1;
      }
      return false;
    };

    return events.some((ev) => matchesNonRecurring(ev, d) || matchesRecurring(ev, d));
  };

  const selectionEvents = normalizedSelection
    ? events.filter((ev) => {
        const evStart = startOfDay(new Date(ev.start));
        const evEnd = endOfDay(new Date(ev.end));
        const selStart = startOfDay(normalizedSelection.start);
        const selEnd = endOfDay(normalizedSelection.end);
        return !(evEnd < selStart || evStart > selEnd);
      })
    : [];

  const handleDayClick = (day, e) => {
    if (e?.shiftKey && selectionStart) {
      setSelectionEnd(day);
      return;
    }
    setSelectionStart(day);
    setSelectionEnd(day);
  };

  const openComposer = () => {
    const base =
      normalizedSelection?.start ? normalizedSelection.start : new Date();
    const baseEnd =
      normalizedSelection?.end ? normalizedSelection.end : base;

    setComposerStart(format(base, "yyyy-MM-dd"));
    setComposerEnd(format(baseEnd, "yyyy-MM-dd"));
    setComposerRepeat("none");
    setComposerRepeatUntil(format(addYears(base, 1), "yyyy-MM-dd"));
    setEditingEventId(null);
    setDraftTitle("");
    setDraftNotes("");
    setComposerOpen(true);
  };

  const openComposerForEdit = (ev) => {
    setComposerStart(format(new Date(ev.start), "yyyy-MM-dd"));
    setComposerEnd(format(new Date(ev.end), "yyyy-MM-dd"));
    setComposerRepeat(ev.repeat || "none");
    setComposerRepeatUntil(
      ev.repeatUntil
        ? format(new Date(ev.repeatUntil), "yyyy-MM-dd")
        : format(addYears(new Date(ev.start), 1), "yyyy-MM-dd")
    );
    setDraftTitle(ev.title || "");
    setDraftNotes(ev.notes || "");
    setEditingEventId(ev.id);
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setEditingEventId(null);
  };

  const handleAddEvent = () => {
    if (!composerStart || !composerEnd) return;
    const title = draftTitle.trim();
    const notes = draftNotes.trim();
    if (!title && !notes) return;

    const startDate = startOfDay(new Date(`${composerStart}T00:00:00`));
    const endDate = startOfDay(new Date(`${composerEnd}T00:00:00`));
    const start = startDate <= endDate ? startDate : endDate;
    const end = startDate <= endDate ? endDate : startDate;

    const repeat = composerRepeat;
    const repeatUntil =
      repeat !== "none" && composerRepeatUntil
        ? startOfDay(new Date(`${composerRepeatUntil}T00:00:00`)).toISOString()
        : null;

    const upsert = (list) => {
      if (!editingEventId) {
        return [
          ...list,
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            start: start.toISOString(),
            end: end.toISOString(),
            title,
            notes,
            repeat,
            repeatUntil,
            createdAt: new Date().toISOString(),
          },
        ];
      }

      return list.map((ev) =>
        ev.id === editingEventId
          ? {
              ...ev,
              start: start.toISOString(),
              end: end.toISOString(),
              title,
              notes,
              repeat,
              repeatUntil,
              updatedAt: new Date().toISOString(),
            }
          : ev
      );
    };

    const next = upsert(events);
    persistEvents(next);
    setDraftTitle("");
    setDraftNotes("");
    closeComposer();
  };

  const handleDeleteEvent = (id) => {
    persistEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="wall">
      <div className="layout">
        <div className="calendarCard">
          <div className="spiral"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={format(currentDate, "yyyy-MM")}
              initial={{
                rotateX: direction === 1 ? -90 : 90,
                opacity: 0,
              }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{
                rotateX: direction === 1 ? 90 : -90,
                opacity: 0,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformOrigin: "top center" }}
            >
              <div
                className="imageHeader"
                style={{ backgroundImage: `url(${imageUrl})` }}
              ></div>

              <div className="header">
                <button onClick={handlePrevMonth}>⬅</button>
                <div className="monthHeading">
                  {format(currentDate, "MMMM yyyy")}
                </div>
                <button onClick={handleNextMonth}>➡</button>
              </div>

              <div className="weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="weekday">
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid">
                {emptyDays.map((_, index) => (
                  <div key={"empty-" + index} className="empty"></div>
                ))}

                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={[
                      "day",
                      isDaySelected(day) ? "daySelected" : "",
                      isDaySelectionEdge(day) ? "daySelectedEdge" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => handleDayClick(day, e)}
                    title="Click to select. Shift+click to select a range."
                  >
                    <span className="dayNumberWrap">
                      <span className="dayNumber">{format(day, "d")}</span>
                      {dayHasAnyEvent(day) ? (
                        <span className="eventStar" aria-label="Has event">
                          ★
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="eventsSide">
          <div className="eventsSideTop">
            <div className="eventsSideTitle">Events & Notes</div>
            <button
              className="plusButton"
                onClick={() => (composerOpen ? closeComposer() : openComposer())}
              aria-label="Add event"
              title="Add event"
            >
              +
            </button>
          </div>

          {composerOpen ? (
            <div className="composer">
              <div className="composerRow">
                <label className="composerLabel">Start</label>
                <input
                  type="date"
                  value={composerStart}
                  onChange={(e) => setComposerStart(e.target.value)}
                  className="eventInput"
                />
              </div>
              <div className="composerRow">
                <label className="composerLabel">End</label>
                <input
                  type="date"
                  value={composerEnd}
                  onChange={(e) => setComposerEnd(e.target.value)}
                  className="eventInput"
                />
              </div>

              <div className="composerRow">
                <label className="composerLabel">Repeat</label>
                <select
                  value={composerRepeat}
                  onChange={(e) => setComposerRepeat(e.target.value)}
                  className="eventInput"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {composerRepeat !== "none" ? (
                <div className="composerRow">
                  <label className="composerLabel">Until</label>
                  <input
                    type="date"
                    value={composerRepeatUntil}
                    onChange={(e) => setComposerRepeatUntil(e.target.value)}
                    className="eventInput"
                  />
                </div>
              ) : null}

              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Event title (e.g. Meeting)"
                className="eventInput"
              />
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="eventTextarea"
                rows={4}
              />

              <div className="composerActions">
                <button
                  className="eventButton secondary"
                  onClick={closeComposer}
                >
                  Close
                </button>
                <button className="eventButton" onClick={handleAddEvent}>
                  {editingEventId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="eventPanelTop">
            <div className="eventPanelTitle">{selectionLabel}</div>
            <div className="eventPanelHint">
              Calendar selection only highlights; use + to add events.
            </div>
          </div>

          <div className="eventList">
            {events.length ? (
              events
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.start).getTime() - new Date(b.start).getTime()
                )
                .map((ev) => (
                  <div key={ev.id} className="eventItem">
                    <div className="eventItemMain">
                      <div className="eventItemTitle">
                        {ev.title || "(No title)"}
                      </div>
                      <div className="eventItemDates">
                        {format(new Date(ev.start), "d MMM")} –{" "}
                        {format(new Date(ev.end), "d MMM")}
                      </div>
                      {ev.repeat && ev.repeat !== "none" ? (
                        <div className="eventItemDates">
                          Repeats {ev.repeat}
                          {ev.repeatUntil
                            ? ` until ${format(
                                new Date(ev.repeatUntil),
                                "d MMM yyyy"
                              )}`
                            : ""}
                        </div>
                      ) : null}
                      {ev.notes ? (
                        <div className="eventItemNotes">{ev.notes}</div>
                      ) : null}
                    </div>
                    <div className="eventActions">
                      <button
                        className="eventEdit"
                        onClick={() => openComposerForEdit(ev)}
                        aria-label="Edit event"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="eventDelete"
                        onClick={() => handleDeleteEvent(ev.id)}
                        aria-label="Delete event"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="eventEmpty">
                No events yet. Click <b>+</b> to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;