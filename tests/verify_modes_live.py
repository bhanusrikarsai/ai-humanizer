import urllib.request
import json

test_text = "It is crucial to note that candidate Alice Chen demonstrated exceptional aptitude during the technical assessment on October 14, 2023. Delve into her performance, and one observes that she attained a score of 94% in Python and completed 4 out of 4 system design challenges. Furthermore, she effectively leveraged Kubernetes and PostgreSQL. In conclusion, we should proceed with an offer of $185,000."

modes = ["stealth", "academic", "professional", "conversational", "polished"]

print("======================================================================")
print("VERIFYING ALL 5 AI HUMANIZATION MODES ACROSS LIVE FASTAPI BACKEND")
print("======================================================================")

results = {}

for mode in modes:
    payload = {
        "text": test_text,
        "context": "Recruiter Feedback",
        "tone": mode,
        "engine": "local",
        "force_humanize": True
    }
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/humanize",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        rewritten = data.get("final_text", "")
        eval_metrics = data.get("evaluation_metrics", {})
        rate = eval_metrics.get("entity_preservation_score", 0)
        factual = eval_metrics.get("condition_met", False)
        robotic_before = eval_metrics.get("initial_robotic_score", 0)
        robotic_after = eval_metrics.get("final_robotic_score", 0)
        results[mode] = rewritten
        print(f"\n[MODE: {mode.upper()}]")
        print(f"  Entity Preservation: {rate}% | Factual Pass: {factual}")
        print(f"  Robotic Score: {robotic_before}% -> {robotic_after}%")
        print(f"  Output:\n  \"{rewritten}\"")

# Confirm uniqueness
distinct_count = len(set(results.values()))
print("\n----------------------------------------------------------------------")
print(f"Total Modes: {len(modes)} | Unique Output Texts: {distinct_count}/{len(modes)}")
assert distinct_count == len(modes), "Each mode must produce distinctly differentiated text!"
print(">>> ALL 5 MODES SUCCESSFULLY PRODUCED DISTINCT, HIGH-QUALITY OUTPUTS! <<<")
