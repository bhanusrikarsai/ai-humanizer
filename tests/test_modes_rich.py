import urllib.request, json

# Richer multi-sentence text with no early-pipeline clichés so Phase 4 kicks in harder
text = """The candidate showed exceptional technical performance across all evaluation stages. We have reviewed the results and overall the scores were strong. In addition, the team noted strong problem-solving skills. We recommend extending an offer of $185,000. Also, we should move quickly to secure this candidate before competing offers arrive. The candidate used Python and Kubernetes throughout and improved system reliability by 40%."""

tones = ['stealth', 'conversational', 'academic', 'professional', 'polished']
for tone in tones:
    payload = json.dumps({'text': text, 'context': 'Recruiter Feedback', 'tone': tone, 'aggressiveness': 'balanced', 'engine': 'local'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/humanize', data=payload, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    body = json.loads(res.read().decode('utf-8'))
    final = body['final_text']
    print(f"[{tone.upper():<14}]")
    print(f"  {final}")
    print()
