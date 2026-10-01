# 🐾 Pawsitive Rehab: Open-Source Pet Recovery Planner

An open-source, retro-arcade recovery platform engineered to translate complex veterinary discharge summaries and unstructured caretaker observations into structured, actionable home-care protocols.

---

## 🕹️ Project Overview

Post-surgery and injury recovery for pets is overwhelming. Caretakers face dense medical paperwork while running on sleep deprivation. When a pet limps, whimpers, or exhibits mild swelling, owners panic because they cannot distinguish between expected healing milestones and critical emergencies.

**Pawsitive Rehab** bridges this gap:
- **Vet Note & Ingestion Deck**: Ingests clinical discharge notes or raw caretaker observations (e.g., *"his leg looks slightly swollen and he's whimpering"*).
- **Dynamic Recovery Monitor**: Dynamically structures unstructured input into interactive checklist cards:
  - 💊 Medication Schedules (with retro task completion checkboxes)
  - 🏃 Activity Restrictions & Movement Boundaries
  - 🥗 Dietary Directives & Hydration Rules
  - 📅 Follow-up Timelines & Clinical Milestones
- **Red Flag Monitor**: Surfaces critical safety hazards with an animated retro caution alert.
- **Bilingual Roman Urdu Engine**: Latency-free single-click translation into conversational Roman Urdu for localized family coordination.
- **LocalStorage Data Vault**: Retro floppy-disk persistence saving active session state directly to browser storage.

---

## 🧠 Open-Source & Open-Weight AI Architecture

This project is built around open-weight AI to provide transparent, accessible veterinary support:
* **Core Model**: **Google Gemma 4** (accessed via the Google Gemini API)
* **Model Terms & License**: [Google Gemma Terms of Use](https://ai.google.dev/gemma/terms)
* **Implementation**: Client-side structured inference via the Gemini API endpoint enforcing strict JSON schema constraints (`responseMimeType: "application/json"`).
* **AI Reasoning Trace Terminal**: Exposes a real-time trace log showing the exact step-by-step logic the open model executed to categorize the patient's risk profile.

---

## 💻 Tech Stack & Design

- **Frontend**: Semantic HTML5, CSS3 Variables, Vanilla JavaScript.
- **Visuals**: Retro arcade pixel-art theme utilizing the Google Font **Silkscreen** and high-contrast block-shadows.
- **Audio Synthesizer**: Native Web Audio API (`window.AudioContext`) synthesizing 8-bit square and triangle sound waves directly in the browser (zero external MP3 dependencies).
- **Defensive Engineering**: Robust client-side `try/catch` fallbacks to ensure uninterrupted operation during network fluctuations.

---

## 🚀 Running Locally

1. Clone this repository:
   ```bash
   git clone [https://github.com/hadeedkhanj/pawsitive-rehab-hacktoberfest.git](https://github.com/hadeedkhanj/pawsitive-rehab-hacktoberfest.git)
