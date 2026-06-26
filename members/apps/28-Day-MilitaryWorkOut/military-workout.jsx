import { useState } from "react";

const WEEKS = [
  { label: "Week 1", theme: "Foundation", color: "#4A7C59", light: "#E8F2EC" },
  { label: "Week 2", theme: "Build", color: "#2C5F8A", light: "#E3EEF7" },
  { label: "Week 3", theme: "Intensity", color: "#7A3B2E", light: "#F5EAE7" },
  { label: "Week 4", theme: "Peak", color: "#1A1A2E", light: "#E8E8F0" },
];

const ROTATION = ["PUSH", "PULL", "LEGS", "CONDITIONING"];
const DAY_COLORS = {
  PUSH: { bg: "#FFF3E0", border: "#E65100", label: "#E65100" },
  PULL: { bg: "#E3F2FD", border: "#1565C0", label: "#1565C0" },
  LEGS: { bg: "#F3E5F5", border: "#6A1B9A", label: "#6A1B9A" },
  CONDITIONING: { bg: "#E8F5E9", border: "#2E7D32", label: "#2E7D32" },
};

// Workouts scale in volume each week
const WORKOUTS = {
  PUSH: [
    {
      week: 1,
      exercises: [
        { name: "Push-ups", sets: "3", reps: "12–15" },
        { name: "Pike Push-ups", sets: "3", reps: "8–10" },
        { name: "Tricep Dips (chair/bar)", sets: "3", reps: "10" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "10" },
        { name: "Plank", sets: "3", reps: "30 sec" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Push-ups", sets: "4", reps: "15–18" },
        { name: "Pike Push-ups", sets: "3", reps: "10–12" },
        { name: "Tricep Dips", sets: "3", reps: "12" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "12" },
        { name: "Diamond Push-ups", sets: "3", reps: "8" },
        { name: "Plank", sets: "3", reps: "40 sec" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Push-ups", sets: "4", reps: "18–20" },
        { name: "Decline Push-ups", sets: "3", reps: "12" },
        { name: "Tricep Dips", sets: "4", reps: "12" },
        { name: "Dumbbell Shoulder Press", sets: "4", reps: "12" },
        { name: "Diamond Push-ups", sets: "3", reps: "10" },
        { name: "Plank", sets: "3", reps: "50 sec" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Push-ups to Failure", sets: "3", reps: "Max" },
        { name: "Decline Push-ups", sets: "4", reps: "15" },
        { name: "Tricep Dips", sets: "4", reps: "15" },
        { name: "Dumbbell Shoulder Press", sets: "4", reps: "15" },
        { name: "Diamond Push-ups", sets: "3", reps: "12" },
        { name: "Plank", sets: "3", reps: "60 sec" },
      ],
    },
  ],
  PULL: [
    {
      week: 1,
      exercises: [
        { name: "Pull-ups (or band-assisted)", sets: "3", reps: "5–8" },
        { name: "Dumbbell Bent-Over Row", sets: "3", reps: "10 each" },
        { name: "Inverted Row (under table/bar)", sets: "3", reps: "10" },
        { name: "Dumbbell Bicep Curl", sets: "3", reps: "10" },
        { name: "Dead Hang", sets: "3", reps: "20 sec" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Pull-ups", sets: "4", reps: "6–10" },
        { name: "Dumbbell Bent-Over Row", sets: "3", reps: "12 each" },
        { name: "Inverted Row", sets: "3", reps: "12" },
        { name: "Dumbbell Bicep Curl", sets: "3", reps: "12" },
        { name: "Face Pulls (band)", sets: "3", reps: "15" },
        { name: "Dead Hang", sets: "3", reps: "25 sec" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Pull-ups", sets: "4", reps: "8–12" },
        { name: "Dumbbell Bent-Over Row", sets: "4", reps: "12 each" },
        { name: "Inverted Row", sets: "4", reps: "12" },
        { name: "Hammer Curl", sets: "3", reps: "12 each" },
        { name: "Face Pulls (band)", sets: "3", reps: "15" },
        { name: "Dead Hang", sets: "3", reps: "30 sec" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Pull-ups to Failure", sets: "3", reps: "Max" },
        { name: "Dumbbell Bent-Over Row", sets: "4", reps: "15 each" },
        { name: "Inverted Row", sets: "4", reps: "15" },
        { name: "Hammer Curl", sets: "3", reps: "15 each" },
        { name: "Face Pulls (band)", sets: "4", reps: "15" },
        { name: "Dead Hang", sets: "3", reps: "40 sec" },
      ],
    },
  ],
  LEGS: [
    {
      week: 1,
      exercises: [
        { name: "Air Squats", sets: "3", reps: "20" },
        { name: "Forward Lunges", sets: "3", reps: "10 each" },
        { name: "Glute Bridges", sets: "3", reps: "15" },
        { name: "Calf Raises", sets: "3", reps: "20" },
        { name: "Flutter Kicks", sets: "3", reps: "20 sec" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Air Squats", sets: "4", reps: "25" },
        { name: "Reverse Lunges", sets: "3", reps: "12 each" },
        { name: "Glute Bridges", sets: "3", reps: "20" },
        { name: "Jump Squats", sets: "3", reps: "10" },
        { name: "Calf Raises", sets: "3", reps: "25" },
        { name: "Flutter Kicks", sets: "3", reps: "30 sec" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Goblet Squat (dumbbell)", sets: "4", reps: "15" },
        { name: "Walking Lunges", sets: "3", reps: "12 each" },
        { name: "Single-Leg Glute Bridge", sets: "3", reps: "12 each" },
        { name: "Jump Squats", sets: "3", reps: "15" },
        { name: "Calf Raises", sets: "4", reps: "25" },
        { name: "Flutter Kicks", sets: "3", reps: "40 sec" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Goblet Squat (dumbbell)", sets: "4", reps: "20" },
        { name: "Walking Lunges", sets: "4", reps: "15 each" },
        { name: "Single-Leg Glute Bridge", sets: "4", reps: "15 each" },
        { name: "Jump Squats", sets: "4", reps: "15" },
        { name: "Sumo Squat (dumbbell)", sets: "3", reps: "15" },
        { name: "Flutter Kicks", sets: "3", reps: "50 sec" },
      ],
    },
  ],
  CONDITIONING: [
    {
      week: 1,
      exercises: [
        { name: "Burpees", sets: "3", reps: "8" },
        { name: "Mountain Climbers", sets: "3", reps: "20 sec" },
        { name: "High Knees", sets: "3", reps: "20 sec" },
        { name: "Sit-ups", sets: "3", reps: "15" },
        { name: "Run or Brisk Walk", sets: "1", reps: "15 min" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Burpees", sets: "4", reps: "10" },
        { name: "Mountain Climbers", sets: "3", reps: "30 sec" },
        { name: "High Knees", sets: "3", reps: "30 sec" },
        { name: "Sit-ups", sets: "3", reps: "20" },
        { name: "Jumping Jacks", sets: "3", reps: "30" },
        { name: "Run", sets: "1", reps: "20 min" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Burpees", sets: "4", reps: "12" },
        { name: "Mountain Climbers", sets: "4", reps: "30 sec" },
        { name: "HIIT Sprints (30s on / 30s off)", sets: "6", reps: "rounds" },
        { name: "Sit-ups", sets: "4", reps: "20" },
        { name: "Bear Crawl", sets: "3", reps: "20 m" },
        { name: "Run", sets: "1", reps: "20 min" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Burpees to Failure", sets: "3", reps: "Max" },
        { name: "Mountain Climbers", sets: "4", reps: "40 sec" },
        { name: "HIIT Sprints (30s on / 20s off)", sets: "8", reps: "rounds" },
        { name: "Sit-ups", sets: "4", reps: "25" },
        { name: "Bear Crawl", sets: "4", reps: "20 m" },
        { name: "Run", sets: "1", reps: "25 min" },
      ],
    },
  ],
};

const TIPS = [
  "Rest 60–90 sec between sets. Keep it tight.",
  "Hydrate before, during, and after — at least 500ml per session.",
  "Warm up 5 min: arm circles, leg swings, hip rotations.",
  "Cool down 5 min: stretch major muscle groups worked today.",
  "Sleep 7–9 hours. That's when adaptation happens.",
  "If a session feels too easy, add a set. If too hard, drop reps.",
  "Consistency beats perfection. A bad workout beats no workout.",
];

function getDayData(dayIndex) {
  const weekIndex = Math.floor(dayIndex / 7);
  const rotation = ROTATION[dayIndex % 4];
  return {
    day: dayIndex + 1,
    week: weekIndex + 1,
    weekData: WEEKS[weekIndex],
    type: rotation,
    workout: WORKOUTS[rotation][weekIndex],
  };
}

export default function MilitaryWorkout() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [completedDays, setCompletedDays] = useState(new Set());
  const [view, setView] = useState("calendar"); // calendar | day

  const toggleComplete = (day) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const openDay = (dayIndex) => {
    setSelectedDay(dayIndex);
    setView("day");
  };

  const closeDay = () => {
    setView("calendar");
    setSelectedDay(null);
  };

  const dayData = selectedDay !== null ? getDayData(selectedDay) : null;

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace", background: "#0D0D0D", minHeight: "100vh", color: "#E8E0D0" }}>
      {/* Header */}
      <div style={{ background: "#0D0D0D", borderBottom: "2px solid #4A7C59", padding: "20px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#4A7C59", textTransform: "uppercase", marginBottom: 4 }}>
            28-Day Program · Intermediate · Pull-up Bar + Dumbbells
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#E8E0D0", letterSpacing: "0.05em" }}>
            MILITARY CONDITIONING
          </h1>
          <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 11, color: "#888" }}>
            {WEEKS.map((w, i) => (
              <span key={i} style={{ color: w.color }}>
                {w.label}: {w.theme}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {view === "calendar" && (
          <>
            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 6 }}>
                <span>PROGRESS</span>
                <span>{completedDays.size} / 28 days</span>
              </div>
              <div style={{ background: "#1A1A1A", height: 6, borderRadius: 3 }}>
                <div
                  style={{
                    background: "#4A7C59",
                    height: "100%",
                    borderRadius: 3,
                    width: `${(completedDays.size / 28) * 100}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {Object.entries(DAY_COLORS).map(([type, c]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#888" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c.border }} />
                  <span>{type}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid by week */}
            {WEEKS.map((week, wi) => (
              <div key={wi} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: week.color, letterSpacing: "0.15em" }}>
                    {week.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>{week.theme.toUpperCase()}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const dayIndex = wi * 7 + di;
                    const { type, day } = getDayData(dayIndex);
                    const c = DAY_COLORS[type];
                    const done = completedDays.has(dayIndex);
                    return (
                      <button
                        key={di}
                        onClick={() => openDay(dayIndex)}
                        style={{
                          background: done ? c.border : "#1A1A1A",
                          border: `1px solid ${done ? c.border : "#333"}`,
                          borderRadius: 6,
                          padding: "10px 4px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 10, color: done ? "#fff" : "#555" }}>D{day}</span>
                        <span style={{ fontSize: 7, color: done ? "#fff" : c.border, letterSpacing: "0.05em", textAlign: "center" }}>
                          {type === "CONDITIONING" ? "COND" : type}
                        </span>
                        {done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Tip of the day */}
            <div style={{ marginTop: 8, padding: "14px 16px", background: "#111", border: "1px solid #333", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: "#4A7C59", letterSpacing: "0.2em", marginBottom: 6 }}>FIELD NOTE</div>
              <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
                {TIPS[completedDays.size % TIPS.length]}
              </div>
            </div>
          </>
        )}

        {view === "day" && dayData && (
          <div>
            {/* Back */}
            <button
              onClick={closeDay}
              style={{ background: "none", border: "none", color: "#4A7C59", cursor: "pointer", fontSize: 12, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
            >
              ← Back to Calendar
            </button>

            {/* Day header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.2em", marginBottom: 4 }}>
                DAY {dayData.day} · {dayData.weekData.label.toUpperCase()} — {dayData.weekData.theme.toUpperCase()}
              </div>
              <h2 style={{ margin: 0, fontSize: 22, color: DAY_COLORS[dayData.type].border, letterSpacing: "0.08em" }}>
                {dayData.type} DAY
              </h2>
              <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
                30–45 min · Intermediate · Rest 60–90 sec between sets
              </div>
            </div>

            {/* Warm-up */}
            <div style={{ padding: "12px 14px", background: "#111", border: "1px solid #222", borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#4A7C59", letterSpacing: "0.2em", marginBottom: 6 }}>WARM-UP · 5 MIN</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>
                Arm circles · Leg swings · Hip rotations · 2 min light jog in place
              </div>
            </div>

            {/* Exercises */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.2em", marginBottom: 10 }}>EXERCISES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayData.workout.exercises.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#111",
                      border: `1px solid ${i === 0 ? DAY_COLORS[dayData.type].border + "44" : "#222"}`,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 10, color: "#444", minWidth: 18 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 13, color: "#E8E0D0" }}>{ex.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                      <span style={{ color: DAY_COLORS[dayData.type].border }}>{ex.sets} sets</span>
                      <span style={{ color: "#888" }}>× {ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cool-down */}
            <div style={{ padding: "12px 14px", background: "#111", border: "1px solid #222", borderRadius: 8, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#2C5F8A", letterSpacing: "0.2em", marginBottom: 6 }}>COOL-DOWN · 5 MIN</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>
                {dayData.type === "PUSH" && "Chest doorframe stretch · Tricep overhead stretch · Child's pose"}
                {dayData.type === "PULL" && "Lat stretch (arm overhead) · Bicep wall stretch · Neck rolls"}
                {dayData.type === "LEGS" && "Quad stretch · Hip flexor lunge · Hamstring floor stretch · Calf stretch"}
                {dayData.type === "CONDITIONING" && "Walk 2–3 min · Deep breathing · Full-body stretch circuit"}
              </div>
            </div>

            {/* Mark complete */}
            <button
              onClick={() => { toggleComplete(selectedDay); closeDay(); }}
              style={{
                width: "100%",
                padding: "14px",
                background: completedDays.has(selectedDay) ? "#1A1A1A" : "#4A7C59",
                border: completedDays.has(selectedDay) ? "1px solid #333" : "none",
                borderRadius: 8,
                color: completedDays.has(selectedDay) ? "#555" : "#fff",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 700,
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              {completedDays.has(selectedDay) ? "MARK INCOMPLETE" : "✓ MARK DAY COMPLETE"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
