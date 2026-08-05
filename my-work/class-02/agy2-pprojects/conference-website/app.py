from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Conference Metadata
CONFERENCE_INFO = {
    "title": "Google Cloud Tech Summit 2026",
    "subtitle": "Empowering Enterprise Innovation with Generative AI, Cloud Infrastructure & Data Systems",
    "date": "October 22, 2026",
    "iso_date": "2026-10-22",
    "time_range": "09:00 AM - 06:10 PM PDT",
    "location": "Google Developer Center, 345 Spear St, San Francisco, CA & Online Virtual Stream",
    "venue_short": "San Francisco, CA (Hybrid)",
    "description": "A premiere 1-day technical conference dedicated to hands-on Google Cloud technologies, scalable architecture patterns, AI/ML engineering, high-availability databases, and zero-trust security."
}

# 10 Technical Talks + 1 Lunch Break
SCHEDULE_DATA = [
    {
        "id": "talk-1",
        "type": "talk",
        "title": "Building Next-Gen Enterprise AI Applications with Vertex AI & Gemini 1.5 Pro",
        "time": "09:00 AM - 09:45 AM",
        "duration": "45 mins",
        "category": "Category 1: AI & Machine Learning",
        "category_id": "ai-ml",
        "description": "Discover how to harness Google Cloud's Vertex AI platform and Gemini 1.5 Pro multimodal models to build production-ready context-aware agents, RAG workflows, and enterprise automation pipelines with low latency.",
        "speakers": [
            {
                "id": "spk-1",
                "first_name": "Elena",
                "last_name": "Rostova",
                "full_name": "Elena Rostova",
                "role": "Principal AI Architect",
                "company": "Google Cloud",
                "bio": "Leading AI research & enterprise deployment strategies for global organizations.",
                "linkedin_url": "https://www.linkedin.com/in/elena-rostova-cloud",
                "avatar_initials": "ER",
                "avatar_color": "#4285F4"
            },
            {
                "id": "spk-2",
                "first_name": "Marcus",
                "last_name": "Vance",
                "full_name": "Marcus Vance",
                "role": "Senior ML Engineer",
                "company": "DeepMind",
                "bio": "Specializing in large language model fine-tuning, prompt optimization, and retrieval systems.",
                "linkedin_url": "https://www.linkedin.com/in/marcus-vance-dev",
                "avatar_initials": "MV",
                "avatar_color": "#34A853"
            }
        ]
    },
    {
        "id": "talk-2",
        "type": "talk",
        "title": "Modern Serverless Architectures with Cloud Run, Eventarc & Functions",
        "time": "09:50 AM - 10:35 AM",
        "duration": "45 mins",
        "category": "Category 2: Cloud Infrastructure",
        "category_id": "cloud-infra",
        "description": "Learn how to architect event-driven serverless applications using Cloud Run and Eventarc. We will cover automated scale-to-zero, container security, and cost optimization techniques for modern cloud-native systems.",
        "speakers": [
            {
                "id": "spk-3",
                "first_name": "Sarah",
                "last_name": "Lin",
                "full_name": "Sarah Lin",
                "role": "Staff Cloud Engineer",
                "company": "Google Cloud",
                "bio": "Passionate about microservices, containerization, and serverless developer productivity tools.",
                "linkedin_url": "https://www.linkedin.com/in/sarah-lin-cloud",
                "avatar_initials": "SL",
                "avatar_color": "#EA4335"
            }
        ]
    },
    {
        "id": "talk-3",
        "type": "talk",
        "title": "Ultra-Low Latency Global Analytics with Cloud Spanner & AlloyDB",
        "time": "10:40 AM - 11:25 AM",
        "duration": "45 mins",
        "category": "Category 2: Data & Databases",
        "category_id": "data-databases",
        "description": "Explore high-availability database architectures on GCP. Dive into Cloud Spanner's global consistency model and AlloyDB's PostgreSQL compatibility for high-throughput enterprise transaction processing.",
        "speakers": [
            {
                "id": "spk-4",
                "first_name": "Priya",
                "last_name": "Sharma",
                "full_name": "Priya Sharma",
                "role": "Database Infrastructure Lead",
                "company": "Google Cloud",
                "bio": "12+ years optimizing distributed database engines and mission-critical transactional platforms.",
                "linkedin_url": "https://www.linkedin.com/in/priya-sharma-data",
                "avatar_initials": "PS",
                "avatar_color": "#FBBC04"
            },
            {
                "id": "spk-5",
                "first_name": "David",
                "last_name": "Miller",
                "full_name": "David Miller",
                "role": "Principal Data Architect",
                "company": "FinTech Scaleup",
                "bio": "Expert in enterprise database migrations, real-time analytics streaming, and high-availability systems.",
                "linkedin_url": "https://www.linkedin.com/in/david-miller-tech",
                "avatar_initials": "DM",
                "avatar_color": "#4285F4"
            }
        ]
    },
    {
        "id": "talk-4",
        "type": "talk",
        "title": "Zero Trust Security, BeyondCorp & Cloud IAM Best Practices",
        "time": "11:30 AM - 12:15 PM",
        "duration": "45 mins",
        "category": "Category 1: Cloud Security",
        "category_id": "cloud-security",
        "description": "Safeguard enterprise cloud infrastructure with GCP BeyondCorp Enterprise, Workload Identity Federation, and automated Security Command Center policies against modern zero-day cybersecurity threats.",
        "speakers": [
            {
                "id": "spk-6",
                "first_name": "Alex",
                "last_name": "Rivera",
                "full_name": "Alex Rivera",
                "role": "Cloud Security Specialist",
                "company": "Google Mandiant",
                "bio": "Threat intelligence expert helping organizations enforce zero-trust security postures and identity governance.",
                "linkedin_url": "https://www.linkedin.com/in/alex-rivera-security",
                "avatar_initials": "AR",
                "avatar_color": "#EA4335"
            }
        ]
    },
    {
        "id": "lunch-break",
        "type": "break",
        "title": "Networking Lunch & Google Cloud Lounge",
        "time": "12:15 PM - 01:15 PM",
        "duration": "60 mins",
        "category": "Lunch Break",
        "category_id": "lunch-break",
        "description": "Complimentary 60-minute networking lunch break. Connect with fellow engineers, explore interactive Google Cloud tech demo kiosks, and enjoy gourmet catering provided at the main dining lounge.",
        "speakers": []
    },
    {
        "id": "talk-5",
        "type": "talk",
        "title": "Real-Time Event Streaming Pipelines using Dataflow & Pub/Sub",
        "time": "01:15 PM - 02:00 PM",
        "duration": "45 mins",
        "category": "Category 2: Data & Databases",
        "category_id": "data-databases",
        "description": "Build resilient, scalable streaming data pipelines with Apache Beam on Google Cloud Dataflow. Process millions of events per second with Pub/Sub and BigQuery stream ingestion.",
        "speakers": [
            {
                "id": "spk-7",
                "first_name": "Chen",
                "last_name": "Wei",
                "full_name": "Chen Wei",
                "role": "Staff Data Platform Engineer",
                "company": "DataTech Systems",
                "bio": "Specializing in high-throughput streaming architectures, distributed stream processing, and event-driven data lakes.",
                "linkedin_url": "https://www.linkedin.com/in/chen-wei-stream",
                "avatar_initials": "CW",
                "avatar_color": "#34A853"
            }
        ]
    },
    {
        "id": "talk-6",
        "type": "talk",
        "title": "Next-Level Kubernetes Operations with GKE Autopilot & Anthos",
        "time": "02:05 PM - 02:50 PM",
        "duration": "45 mins",
        "category": "Category 2: Cloud Infrastructure",
        "category_id": "cloud-infra",
        "description": "Simplify Kubernetes operations using Google Kubernetes Engine (GKE) Autopilot. Explore hands-off node provisioning, automated cluster hardening, and multi-cluster mesh governance with Anthos.",
        "speakers": [
            {
                "id": "spk-8",
                "first_name": "Jordan",
                "last_name": "Hayes",
                "full_name": "Jordan Hayes",
                "role": "Container Solutions Architect",
                "company": "Google Cloud",
                "bio": "Kubernetes contributor focused on cluster automation, service mesh, and multi-cloud resilience.",
                "linkedin_url": "https://www.linkedin.com/in/jordan-hayes-k8s",
                "avatar_initials": "JH",
                "avatar_color": "#4285F4"
            },
            {
                "id": "spk-9",
                "first_name": "Amara",
                "last_name": "Okafor",
                "full_name": "Amara Okafor",
                "role": "Senior Site Reliability Engineer",
                "company": "CloudScale Inc",
                "bio": "DevOps veteran with deep expertise in declarative infrastructure, GitOps pipelines, and chaos engineering.",
                "linkedin_url": "https://www.linkedin.com/in/amara-okafor-devops",
                "avatar_initials": "AO",
                "avatar_color": "#FBBC04"
            }
        ]
    },
    {
        "id": "talk-7",
        "type": "talk",
        "title": "Enterprise MLOps: Automated Model Training & Monitoring at Scale",
        "time": "02:55 PM - 03:40 PM",
        "duration": "45 mins",
        "category": "Category 1: AI & Machine Learning",
        "category_id": "ai-ml",
        "description": "Automate end-to-end Machine Learning lifecycles with Vertex AI Pipelines, Model Registry, and Feature Store. Learn how to track model drift, trigger automated retraining, and govern production AI models.",
        "speakers": [
            {
                "id": "spk-10",
                "first_name": "Hiroshi",
                "last_name": "Tanaka",
                "full_name": "Hiroshi Tanaka",
                "role": "Lead MLOps Engineer",
                "company": "AI Frontiers",
                "bio": "Pioneering automated ML infrastructure, artifact lineage tracking, and continuous deployment of deep learning models.",
                "linkedin_url": "https://www.linkedin.com/in/hiroshi-tanaka-mlops",
                "avatar_initials": "HT",
                "avatar_color": "#EA4335"
            }
        ]
    },
    {
        "id": "talk-8",
        "type": "talk",
        "title": "Multi-Cloud Governance, Cost Optimization & FinOps on GCP",
        "time": "03:45 PM - 04:30 PM",
        "duration": "45 mins",
        "category": "Category 1: Cloud Security",
        "category_id": "cloud-security",
        "description": "Gain complete visibility into cloud expenditure and resource allocation. Implement automated budget controls, recommender API insights, and multi-cloud FinOps governance models.",
        "speakers": [
            {
                "id": "spk-11",
                "first_name": "Sofia",
                "last_name": "Benitez",
                "full_name": "Sofia Benitez",
                "role": "Head of Cloud FinOps",
                "company": "Global Cloud Services",
                "bio": "Helping enterprise engineering teams optimize cloud spend and maximize ROI on cloud infrastructure investment.",
                "linkedin_url": "https://www.linkedin.com/in/sofia-benitez-finops",
                "avatar_initials": "SB",
                "avatar_color": "#34A853"
            },
            {
                "id": "spk-12",
                "first_name": "James",
                "last_name": "O'Connor",
                "full_name": "James O'Connor",
                "role": "Principal Cloud Consultant",
                "company": "Google Partner Network",
                "bio": "Specialist in cloud governance framework design, enterprise compliance, and cost observability.",
                "linkedin_url": "https://www.linkedin.com/in/james-oconnor-cloud",
                "avatar_initials": "JO",
                "avatar_color": "#4285F4"
            }
        ]
    },
    {
        "id": "talk-9",
        "type": "talk",
        "title": "Scalable Real-Time Vector Search & Knowledge Graphs with BigQuery",
        "time": "04:35 PM - 05:20 PM",
        "duration": "45 mins",
        "category": "Category 2: Data & Databases",
        "category_id": "data-databases",
        "description": "Learn how to combine BigQuery vector search capabilities with enterprise knowledge graphs for hyper-fast semantic retrieval and RAG indexing at scale.",
        "speakers": [
            {
                "id": "spk-13",
                "first_name": "Tariq",
                "last_name": "Mansoor",
                "full_name": "Tariq Mansoor",
                "role": "Principal Data Engineer",
                "company": "Analytics AI",
                "bio": "Architecting enterprise scale vector databases and real-time knowledge graphs.",
                "linkedin_url": "https://www.linkedin.com/in/tariq-mansoor-data",
                "avatar_initials": "TM",
                "avatar_color": "#FBBC04"
            }
        ]
    },
    {
        "id": "talk-10",
        "type": "talk",
        "title": "Edge Computing & Hybrid Cloud Deployments with Google Distributed Cloud",
        "time": "05:25 PM - 06:10 PM",
        "duration": "45 mins",
        "category": "Category 2: Cloud Infrastructure",
        "category_id": "cloud-infra",
        "description": "Explore Google Distributed Cloud architecture for deploying low-latency AI and containerized workloads directly at edge locations and on-premises data centers.",
        "speakers": [
            {
                "id": "spk-14",
                "first_name": "Rachel",
                "last_name": "Vandenberg",
                "full_name": "Rachel Vandenberg",
                "role": "Distinguished Edge Architect",
                "company": "Google Cloud",
                "bio": "Specialist in hybrid cloud infrastructure, edge compute topology, and distributed systems.",
                "linkedin_url": "https://www.linkedin.com/in/rachel-vandenberg-edge",
                "avatar_initials": "RV",
                "avatar_color": "#34A853"
            }
        ]
    }
]

def get_all_speakers():
    speakers_dict = {}
    for item in SCHEDULE_DATA:
        if item.get("type") == "talk":
            for spk in item.get("speakers", []):
                if spk["id"] not in speakers_dict:
                    speakers_dict[spk["id"]] = spk
    return list(speakers_dict.values())

def filter_schedule(query="", category=""):
    query = query.strip().lower()
    category = category.strip().lower()
    
    results = []
    for item in SCHEDULE_DATA:
        if item["type"] == "break":
            if not query and (not category or category == "all" or category == "lunch-break"):
                results.append(item)
            continue
            
        if category and category != "all":
            item_cat_lower = item["category"].lower()
            item_cat_id_lower = item.get("category_id", "").lower()
            
            if category == "cat1":
                if "category 1" not in item_cat_lower:
                    continue
            elif category == "cat2":
                if "category 2" not in item_cat_lower:
                    continue
            else:
                if category not in item_cat_id_lower and category not in item_cat_lower:
                    continue

        if query:
            match_title = query in item["title"].lower()
            match_desc = query in item["description"].lower()
            match_cat = query in item["category"].lower()
            match_speaker = any(
                query in spk["first_name"].lower() or 
                query in spk["last_name"].lower() or 
                query in spk["full_name"].lower()
                for spk in item.get("speakers", [])
            )
            
            if not (match_title or match_desc or match_cat or match_speaker):
                continue

        results.append(item)
    return results

@app.route("/")
def index():
    categories = [
        {"id": "all", "name": "All Sessions"},
        {"id": "cat1", "name": "Category 1 (AI & Security)"},
        {"id": "cat2", "name": "Category 2 (Infra & Data)"},
        {"id": "ai-ml", "name": "AI & Machine Learning"},
        {"id": "cloud-infra", "name": "Cloud Infrastructure"},
        {"id": "data-databases", "name": "Data & Databases"},
        {"id": "cloud-security", "name": "Cloud Security"}
    ]
    speakers = get_all_speakers()
    talks_only = [item for item in SCHEDULE_DATA if item["type"] == "talk"]
    
    return render_template(
        "index.html",
        conference=CONFERENCE_INFO,
        schedule=SCHEDULE_DATA,
        talks_only=talks_only,
        talk_count=len(talks_only),
        speakers=speakers,
        speaker_count=len(speakers),
        categories=categories
    )

@app.route("/api/schedule", methods=["GET"])
def api_schedule():
    q = request.args.get("q", "")
    category = request.args.get("category", "")
    filtered = filter_schedule(query=q, category=category)
    return jsonify({
        "status": "success",
        "count": len(filtered),
        "total_talks": len([item for item in filtered if item["type"] == "talk"]),
        "events": filtered
    })

@app.route("/api/talks", methods=["GET"])
def api_talks():
    q = request.args.get("q", "")
    category = request.args.get("category", "")
    filtered = filter_schedule(query=q, category=category)
    talks = [item for item in filtered if item["type"] == "talk"]
    return jsonify({
        "status": "success",
        "count": len(talks),
        "talks": talks
    })

@app.route("/api/talk/<talk_id>", methods=["GET"])
def api_talk_detail(talk_id):
    for item in SCHEDULE_DATA:
        if item["id"] == talk_id:
            return jsonify({
                "status": "success",
                "talk": item
            })
    return jsonify({"status": "error", "message": "Talk not found"}), 404

@app.route("/api/speakers", methods=["GET"])
def api_speakers():
    speakers = get_all_speakers()
    q = request.args.get("q", "").strip().lower()
    if q:
        speakers = [
            s for s in speakers
            if q in s["first_name"].lower() or q in s["last_name"].lower() or q in s["full_name"].lower() or q in s["company"].lower()
        ]
    return jsonify({
        "status": "success",
        "count": len(speakers),
        "speakers": speakers
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
