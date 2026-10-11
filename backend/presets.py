"""
Test presets reflecting the exact problem statement domains:
1. Candidate Feedback
2. Recruiter Outreach Note
3. Technical Interview Questions
4. Performance Summary Report
5. Already-Human Text (Tests resistance to unnecessary rewriting)
"""

PRESETS = {
    "recruiter_feedback": {
        "title": "Robotic Candidate Feedback",
        "context": "Recruiter Feedback",
        "tone": "conversational",
        "text": (
            "It is crucial to note that candidate Alice Chen demonstrated exceptional aptitude during "
            "her technical evaluation on October 12, 2026. Delve into her performance, and one observes "
            "that she attained a score of 94% on System Design and completed 4 out of 4 LeetCode "
            "hard challenges in 45 minutes using Python and Kubernetes. Furthermore, her communication "
            "serves as a testament to her senior caliber. In conclusion, it is strongly recommended "
            "that the team extend an offer of $165,000 per annum without delay."
        ),
        "expected_entities": ["Alice Chen", "October 12, 2026", "94%", "4 out of 4", "45 minutes", "Python", "Kubernetes", "$165,000"],
        "expected_robotic_high": True
    },
    "candidate_outreach": {
        "title": "Formulaic Recruiter Outreach Email",
        "context": "Candidate Communication",
        "tone": "conversational",
        "text": (
            "Dear David Kumar, I hope this email finds you well in these bustling times. "
            "In today's fast-paced technological tapestry, your multifaceted background at Stripe "
            "caught our keen eye. It is paramount to highlight that our team at CloudScale is seeking a "
            "Staff Backend Engineer with over 6 years of experience in Go and PostgreSQL. Furthermore, "
            "we are thrilled to offer a flexible remote stipend of $15,000 alongside comprehensive health benefits. "
            "Delve into this golden opportunity and let us schedule an introductory discourse on Monday at 3:00 PM EST."
        ),
        "expected_entities": ["David Kumar", "Stripe", "CloudScale", "Staff Backend Engineer", "6 years", "Go", "PostgreSQL", "$15,000", "Monday at 3:00 PM EST"],
        "expected_robotic_high": True
    },
    "interview_questions": {
        "title": "Templated Interview Questions",
        "context": "Technical Interview Questions",
        "tone": "professional",
        "text": (
            "Could you elucidate in meticulous detail the comprehensive architectural mechanisms by which you "
            "optimized database latency from 320ms down to 18ms at Acme Corp in Q2 2025? "
            "Furthermore, it is pivotal to delineate the multifaceted trade-offs between Redis caching "
            "and PostgreSQL read replicas. Please furnish empirical evidence regarding how your 99.99% SLA was preserved."
        ),
        "expected_entities": ["320ms", "18ms", "Acme Corp", "Q2 2025", "Redis", "PostgreSQL", "99.99% SLA"],
        "expected_robotic_high": True
    },
    "executive_summary": {
        "title": "Robotic Performance Summary",
        "context": "Summary & Report",
        "tone": "polished",
        "text": (
            "In summary, Q3 2026 was a testament to our engineering division's unwavering commitment. "
            "Delving into the metrics, team velocity climbed by 34.2%, and sprint burn-down reached 98.7% fidelity. "
            "Notably, lead architect Sarah Lin mitigated 14 critical CVE vulnerabilities in the Docker pipeline. "
            "In conclusion, the multifaceted initiatives spearheaded by our 12 engineers successfully safeguarded "
            "our $2.4M enterprise contract with FinTech Global."
        ),
        "expected_entities": ["Q3 2026", "34.2%", "98.7%", "Sarah Lin", "14 critical CVE", "Docker", "12 engineers", "$2.4M", "FinTech Global"],
        "expected_robotic_high": True
    },
    "already_human": {
        "title": "Already-Human Recruiter Note (Tests Rewrite Resistance)",
        "context": "Recruiter Feedback",
        "tone": "conversational",
        "text": (
            "Had a quick chat with Marcus today. He walked me through how he refactored their Kafka ingest "
            "pipeline last August, which cut downtime by 40%. He came across super clear, answered all my "
            "questions without hesitation, and wants to move forward with the round 2 coding interview next Tuesday."
        ),
        "expected_entities": ["Marcus", "Kafka", "last August", "40%", "round 2", "next Tuesday"],
        "expected_robotic_high": False
    },
    "ai_definition": {
        "title": "Textbook AI Definition (General Writing)",
        "context": "General Writing",
        "tone": "stealth",
        "text": (
            "Artificial intelligence (AI) is the ability of a computer system or machine to perform tasks "
            "that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language."
        ),
        "expected_entities": [],
        "expected_robotic_high": True
    },
    "machine_learning_essay": {
        "title": "Robotic Tech Essay (Nominalizations & Passive Voice)",
        "context": "General Writing",
        "tone": "stealth",
        "text": (
            "Machine learning is characterized by the implementation of complex statistical algorithms that enable "
            "computing systems to extract patterns from data without explicit programming. It is crucial to note that "
            "the utilization of neural networks plays a pivotal role in optimizing operational throughput in modern analytics."
        ),
        "expected_entities": ["Machine learning"],
        "expected_robotic_high": True
    }
}
