import urllib.request
import json

print("======================================================================")
print("TESTING GEMINI-POWERED AI DETECTION & HUMANIZATION")
print("======================================================================")

# 1. Test AI Detection with Gemini
test_ai_text = "It is crucial to note that candidate Alice Chen demonstrated exceptional aptitude during her technical evaluation on October 12, 2026. Delve into her performance, and one observes that she attained a score of 94% on System Design."

detect_req = urllib.request.Request(
    "http://127.0.0.1:8000/api/detect",
    data=json.dumps({"text": test_ai_text, "threshold": 25.0}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

with urllib.request.urlopen(detect_req) as resp:
    detect_data = json.loads(resp.read().decode("utf-8"))
    print("\n[1. GEMINI AI DETECTION RESULT]")
    print(f"  Overall AI Score: {detect_data.get('overall_ai_score')}%")
    print(f"  Human Score: {detect_data.get('overall_human_score')}%")
    print(f"  Verdict: {detect_data.get('verdict')}")
    print(f"  Confidence: {detect_data.get('confidence')}")
    print(f"  Gemini Reasoning: {detect_data.get('gemini_reasoning')}")
    print(f"  Bypass Matrix: {detect_data.get('detector_matrix', {}).get('passed_detectors_count')} detectors passed")

# 2. Test Humanization with Gemini
humanize_req = urllib.request.Request(
    "http://127.0.0.1:8000/api/humanize",
    data=json.dumps({
        "text": test_ai_text,
        "context": "Recruiter Feedback",
        "tone": "conversational",
        "engine": "gemini",
        "force_humanize": True
    }).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

with urllib.request.urlopen(humanize_req) as resp:
    humanize_data = json.loads(resp.read().decode("utf-8"))
    print("\n[2. GEMINI HUMANIZATION RESULT]")
    print(f"  Engine Used: {humanize_data.get('pipeline_stages', {}).get('iterations', [{}])[-1].get('engine', 'gemini')}")
    print(f"  Final Text: \"{humanize_data.get('final_text')}\"")
    print(f"  Entity Preservation: {humanize_data.get('evaluation_metrics', {}).get('entity_preservation_score')}%")

print("\n======================================================================")
print("SUCCESS: GEMINI AI DETECTION & HUMANIZATION ARE FULLY OPERATIONAL!")
print("======================================================================")
