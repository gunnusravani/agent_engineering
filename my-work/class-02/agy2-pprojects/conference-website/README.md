# Google Cloud Tech Summit 2026 - 1-Day Technical Conference Website

An interactive, high-performance, single-day technical conference informational web application built for the **Google Cloud Tech Summit 2026**.

The web application is powered by **Python and Flask** on the server side, with a modern, glassmorphic **HTML5, CSS3, and Vanilla JavaScript** front-end featuring real-time multi-criteria search, speaker profiles, session detailing, schedule bookmarking, and calendar exports.

---

## 🌟 Key Features & Requirements Compliance

1. **Home Page & Event Timetable**:
   - Displays conference date (**October 22, 2026**), hybrid venue location (**Google Developer Center, San Francisco, CA & Virtual Stream**), live countdown timer, and complete schedule.
2. **10 Technical Talks**:
   - 10 scheduled talks covering Google Cloud technologies: Vertex AI & Gemini, Cloud Run & Eventarc, Cloud Spanner & AlloyDB, BeyondCorp & Cloud IAM Security, Dataflow & Pub/Sub Streaming, GKE Autopilot & Anthos, Vertex MLOps Pipelines, Multi-Cloud FinOps, BigQuery Vector Search & Knowledge Graphs, and Google Distributed Cloud Edge Computing.
3. **1 to 2 Max Speakers per Talk**:
   - Strict 1-2 speaker constraint per session (e.g., Keynote features 2 speakers, Serverless talk features 1 speaker).
4. **Complete Talk Data Attributes**:
   - Each talk includes `ID`, `Title`, `Speakers` (list of speaker objects), `Category` (Category 1 / Category 2 tags), `Description`, and `Time of talk`.
5. **Speaker Details with LinkedIn URLs**:
   - Each speaker includes `First Name`, `Last Name`, Role, Company, Bio, and direct `LinkedIn URL` (e.g., `https://www.linkedin.com/in/...`).
6. **Multi-Criteria Search & Filter System**:
   - Instant real-time filtering by **Category**, **Speaker** (First Name, Last Name), and **Title**.
   - Interactive category pills (All, Category 1 - AI & Security, Category 2 - Infra & Data, AI & ML, Cloud Infra, Data & Databases, Cloud Security).
7. **60-Minute Lunch Break**:
   - Mid-day lunch break (12:15 PM – 01:15 PM) prominently scheduled with catering info and networking lounge details.
8. **Google Cloud Technologies Theme**:
   - Vibrant dark mode UI inspired by Google Cloud brand colors (Google Blue `#4285F4`, Red `#EA4335`, Yellow `#FBBC04`, Green `#34A853`), glassmorphism, responsive grid/timeline view toggle, and micro-animations.
9. **Tech Stack**:
   - Backend: **Python 3** and **Flask framework** (`app.py`).
   - Frontend: Vanilla **HTML5**, **CSS3**, and **JavaScript** (no heavy external framework dependencies).
10. **Testing & Documentation**:
    - Complete unit test suite (`test_app.py`) verifying all 11 user requirements.
11. **Live Deployment / Launch Ready**:
    - Application executable on `http://127.0.0.1:5050`.

---

## 📁 Project File Structure

```
conference-website/
├── app.py                # Flask server, data models, REST API endpoints, and route handlers
├── test_app.py           # Automated unit test suite verifying all requirements
├── templates/
│   └── index.html        # Main HTML5 Jinja template with responsive layout and modals
├── static/
│   ├── css/
│   │   └── styles.css    # Modern glassmorphism CSS design system, typography & themes
│   └── js/
│       └── app.js        # Client-side search, filtering, bookmarking, modals, & countdown engine
├── README.md             # Complete setup, execution, testing, and customization guide
└── venv/                 # Python virtual environment (dependencies installed)
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Python 3.10+** (Python 3.13 tested)
- `pip` (Python package manager)

### Step 1: Clone / Navigate to Directory
```bash
cd /Users/sravani/Documents/VSCode_projects/agy2-pprojects/conference-website
```

### Step 2: Set up Virtual Environment & Install Dependencies
If the `venv` directory is not yet created, run:
```bash
python3 -m venv venv
./venv/bin/pip install flask
```

### Step 3: Run Automated Unit Tests
To verify all 11 functional requirements (8 talks limit, 1-2 speakers max, LinkedIn URLs, category filtering, search engine, lunch break slot):
```bash
./venv/bin/python3 -m unittest test_app.py -v
```

Expected test output:
```
test_api_talk_detail ... ok
test_google_cloud_theme ... ok
test_home_page ... ok
test_lunch_break ... ok
test_search_by_category ... ok
test_search_by_speaker ... ok
test_search_by_title ... ok
test_speaker_attributes ... ok
test_speaker_limits ... ok
test_talk_attributes ... ok
test_talk_count ... ok

----------------------------------------------------------------------
Ran 11 tests in 0.012s

OK
```

### Step 4: Launch the Web Application Server
Run the Flask server:
```bash
./venv/bin/python3 app.py
```
The application will start on **`http://127.0.0.1:5050`** (or `http://localhost:5050`).

Open your browser and navigate to `http://127.0.0.1:5050` to review the conference site.

---

## 🌐 REST API Reference

The server exposes RESTful JSON endpoints for headless access or front-end consumption:

| Endpoint | Method | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `/` | GET | Renders the primary conference web application HTML | N/A |
| `/api/schedule` | GET | Returns full event timetable (talks + lunch break) | `?q=<term>`, `?category=<cat_id>` |
| `/api/talks` | GET | Returns list of technical talks matching search criteria | `?q=<term>`, `?category=<cat_id>` |
| `/api/talk/<talk_id>` | GET | Returns detailed information for a specific talk by ID | N/A |
| `/api/speakers` | GET | Returns list of all speakers | `?q=<name>` |

### API Response Example (`GET /api/talk/talk-1`):
```json
{
  "status": "success",
  "talk": {
    "id": "talk-1",
    "type": "talk",
    "title": "Building Next-Gen Enterprise AI Applications with Vertex AI & Gemini 1.5 Pro",
    "time": "09:00 AM - 09:45 AM",
    "duration": "45 mins",
    "category": "Category 1: AI & Machine Learning",
    "category_id": "ai-ml",
    "description": "Discover how to harness Google Cloud's Vertex AI platform and Gemini 1.5 Pro multimodal models...",
    "speakers": [
      {
        "id": "spk-1",
        "first_name": "Elena",
        "last_name": "Rostova",
        "full_name": "Elena Rostova",
        "role": "Principal AI Architect",
        "company": "Google Cloud",
        "bio": "Leading AI research & enterprise deployment strategies...",
        "linkedin_url": "https://www.linkedin.com/in/elena-rostova-cloud"
      },
      {
        "id": "spk-2",
        "first_name": "Marcus",
        "last_name": "Vance",
        "full_name": "Marcus Vance",
        "role": "Senior ML Engineer",
        "company": "DeepMind",
        "bio": "Specializing in large language model fine-tuning...",
        "linkedin_url": "https://www.linkedin.com/in/marcus-vance-dev"
      }
    ]
  }
}
```

---

## 🛠️ How to Make Further Changes

### 1. Adding a New Session / Talk
Open `app.py` and add a new dictionary entry to the `SCHEDULE_DATA` list:
```python
{
    "id": "talk-9",
    "type": "talk",
    "title": "Your New Google Cloud Talk Title",
    "time": "04:35 PM - 05:20 PM",
    "duration": "45 mins",
    "category": "Category 2: Cloud Infrastructure",
    "category_id": "cloud-infra",
    "description": "Session description...",
    "speakers": [
        {
            "id": "spk-13",
            "first_name": "Jane",
            "last_name": "Doe",
            "full_name": "Jane Doe",
            "role": "Cloud Developer",
            "company": "Google Cloud",
            "bio": "Developer bio...",
            "linkedin_url": "https://www.linkedin.com/in/janedoe",
            "avatar_initials": "JD",
            "avatar_color": "#4285F4"
        }
    ]
}
```

### 2. Updating Categories
Categories can be customized in both `app.py` (in `SCHEDULE_DATA` and `index()` route) and `templates/index.html`.

### 3. Styling & Custom Themes
Modify `static/css/styles.css` root CSS variables to adjust color tokens (`--gcp-blue`, `--gcp-red`, `--glass-bg`, etc.).

---

## 📄 License
Created for Google Cloud Tech Summit 2026 educational and demonstration purposes.
