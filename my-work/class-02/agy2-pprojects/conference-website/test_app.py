import unittest
import json
from app import app, SCHEDULE_DATA, CONFERENCE_INFO, get_all_speakers

class ConferenceWebsiteTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # 1. Home Page functionality test
    def test_home_page(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        html = response.data.decode('utf-8')
        
        # Verify Home page shows date, location, schedule
        self.assertIn("October 22, 2026", html)
        self.assertIn("San Francisco", html)
        self.assertIn("Google Cloud Tech Summit", html)
        self.assertIn("Conference Schedule & Timetable", html)

    # 2. List of 10 talks in total
    def test_talk_count(self):
        talks = [item for item in SCHEDULE_DATA if item["type"] == "talk"]
        self.assertEqual(len(talks), 10, f"Expected exactly 10 talks, found {len(talks)}")

    # 3. Each talk has 1 or 2 max speakers
    def test_speaker_limits(self):
        talks = [item for item in SCHEDULE_DATA if item["type"] == "talk"]
        for talk in talks:
            speaker_count = len(talk["speakers"])
            self.assertTrue(
                1 <= speaker_count <= 2,
                f"Talk '{talk['title']}' has {speaker_count} speakers. Must be 1 or 2 max."
            )

    # 4. Talk attributes check: ID, Title, Speakers, Category, Description, Time
    def test_talk_attributes(self):
        talks = [item for item in SCHEDULE_DATA if item["type"] == "talk"]
        required_keys = ["id", "title", "speakers", "category", "description", "time"]
        for talk in talks:
            for key in required_keys:
                self.assertIn(key, talk, f"Talk '{talk.get('id')}' is missing required key '{key}'")
                self.assertIsNotNone(talk[key], f"Talk key '{key}' should not be None")

    # 5. Each speaker has First Name, Last Name, and LinkedIn URL
    def test_speaker_attributes(self):
        speakers = get_all_speakers()
        self.assertGreater(len(speakers), 0)
        for spk in speakers:
            self.assertIn("first_name", spk)
            self.assertIn("last_name", spk)
            self.assertIn("linkedin_url", spk)
            self.assertTrue(spk["first_name"].strip() != "")
            self.assertTrue(spk["last_name"].strip() != "")
            self.assertTrue(spk["linkedin_url"].startswith("https://www.linkedin.com/in/"))

    # 6. Lunch break of 60 minutes
    def test_lunch_break(self):
        breaks = [item for item in SCHEDULE_DATA if item["type"] == "break"]
        self.assertEqual(len(breaks), 1)
        lunch = breaks[0]
        self.assertIn("60 mins", lunch["duration"])
        self.assertEqual(lunch["id"], "lunch-break")
        self.assertIn("Lunch", lunch["title"])

    # 7. Search by Category (Category 1, Category 2, topic categories)
    def test_search_by_category(self):
        # Test Category 1 API
        res1 = self.app.get('/api/talks?category=cat1')
        self.assertEqual(res1.status_code, 200)
        data1 = json.loads(res1.data)
        self.assertGreater(data1["count"], 0)
        for talk in data1["talks"]:
            self.assertIn("category 1", talk["category"].lower())

        # Test Category 2 API
        res2 = self.app.get('/api/talks?category=cat2')
        self.assertEqual(res2.status_code, 200)
        data2 = json.loads(res2.data)
        self.assertGreater(data2["count"], 0)
        for talk in data2["talks"]:
            self.assertIn("category 2", talk["category"].lower())

    # 8. Search by Speaker (First Name, Last Name)
    def test_search_by_speaker(self):
        res = self.app.get('/api/talks?q=Elena')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["talks"][0]["id"], "talk-1")

        res_last = self.app.get('/api/talks?q=Rostova')
        data_last = json.loads(res_last.data)
        self.assertEqual(data_last["count"], 1)

    # 9. Search by Title
    def test_search_by_title(self):
        res = self.app.get('/api/talks?q=Kubernetes')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["count"], 1)
        self.assertIn("Kubernetes", data["talks"][0]["title"])

    # 10. Google Cloud Technologies theme test
    def test_google_cloud_theme(self):
        gcp_keywords = ["Vertex AI", "Cloud Run", "Spanner", "BeyondCorp", "Dataflow", "GKE", "MLOps", "FinOps"]
        found_keywords = 0
        all_talk_text = " ".join([t["title"] + " " + t["description"] for t in SCHEDULE_DATA if t["type"] == "talk"])
        for kw in gcp_keywords:
            if kw.lower() in all_talk_text.lower():
                found_keywords += 1
        self.assertGreaterEqual(found_keywords, 5, "Schedule must be themed around Google Cloud Technologies")

    # 11. REST API Talk Detail endpoint
    def test_api_talk_detail(self):
        res = self.app.get('/api/talk/talk-1')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["talk"]["id"], "talk-1")
        self.assertIn("Vertex AI", data["talk"]["title"])

        # Test newly added talks talk-9 and talk-10
        res9 = self.app.get('/api/talk/talk-9')
        self.assertEqual(res9.status_code, 200)
        data9 = json.loads(res9.data)
        self.assertEqual(data9["talk"]["id"], "talk-9")
        self.assertIn("Vector Search", data9["talk"]["title"])

        res10 = self.app.get('/api/talk/talk-10')
        self.assertEqual(res10.status_code, 200)
        data10 = json.loads(res10.data)
        self.assertEqual(data10["talk"]["id"], "talk-10")
        self.assertIn("Edge Computing", data10["talk"]["title"])

if __name__ == "__main__":
    unittest.main()
