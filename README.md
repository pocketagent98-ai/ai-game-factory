# AI Game Factory 🎮

यह repo एक पूरी तरह ऑटोमेटेड AI गेम-बिल्डिंग पाइपलाइन है: आप GitHub Issue में अपना गेम आईडिया डालते हैं, और AI एजेंट उसे GDD → कोड → ऑटो-टेस्ट → Android APK तक बनाता है (Godot 4.7.2 पर)।

## पाइपलाइन

```
Issue (आपका आईडिया)
   → एजेंट docs/GDD.md लिखता है        [इंसानी गेट 1: आप "approved" कमेंट करते हैं]
   → टास्क में तोड़ता है (docs/tasks.md)
   → Godot प्रोजेक्ट + CC0/MIT एसेट्स बनाता है
   → ऑटो-टेस्ट: gdUnit4 + हेडलेस रन + स्क्रीनशॉट विज़न QA
   → APK एक्सपोर्ट (.github/workflows/export.yml)
   → APK artifact + Issue में रिपोर्ट       [इंसानी गेट 2: आप खेलकर देखते हैं]
```

## पहली बार सेटअप (ज़रूरी)

**1. Secrets जोड़ें** — Settings → Secrets and variables → Actions → New repository secret:

| Secret | किससे | काम |
|---|---|---|
| `NVIDIA_API_KEY` | build.nvidia.com | मुख्य कोडिंग मॉडल (base URL workflows में सेट है: `https://integrate.api.nvidia.com/v1`) |
| `GEMINI_API_KEY` | Google AI Studio | GDD/प्लानिंग + स्क्रीनशॉट विज़न QA |
| `OPENROUTER_API_KEY` | ओपन-सोर्स राउटर | फॉलबैक |
| `GH_PAT` | GitHub (fine-grained PAT: Contents Read&write, Issues Read&write) | एजेंट के push के लिए |

⚠️ **API keys कभी भी chat, फाइल या comment में पेस्ट न करें — सिर्फ GitHub Secrets में।** Keys पहले से मौजूद नहीं हैं; ये आपके GitHub पर encrypted रहती हैं और किसी को दिखती नहीं।

**2. एजेंट runtime जोड़ें** — `.github/workflows/agent-build.yml` के `TODO` सेक्शन में दो तैयार विकल्प हैं: (a) OpenHands (किसी भी OpenAI-कम्पैटिबल API के साथ), (b) GitHub के अपने Agentic Workflows (`gh aw`)। एजेंट चलते समय `AGENTS.md` पढ़ता है — वही इस फैक्ट्री का मैनुअल है।

**3. (सबसे बढ़िया, वैकल्पिक) Self-hosted runner** — Settings → Actions → Runners → New self-hosted runner: अपना PC रजिस्टर कर लें, फिर `agent-build.yml` में `runs-on: [self-hosted]` कर दें। Actions मिनट तब अनलिमिटेड और फ्री।

**4. (Release APK के लिए) Android keystore** — debug APK बिना किसी सेटअप के बनती है। Release APK के लिए बाद में: `keytool` से keystore बनाएं, `base64 release.keystore -w 0` से encode करके secrets में `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_USER`, `ANDROID_KEYSTORE_PASSWORD` जोड़ें।

## इस्तेमाल

1. नया Issue खोलें — टाइटल: `Build: <गेम का नाम>`, बॉडी में पूरा आईडिया (जॉनर, मुख्य मैकेनिक्स, कैमरा, कंट्रोल्स, लुक, कहानी जो भी हो)
2. Issue पर `build` लेबल लगाएँ → एजेंट ट्रिगर होता है
3. एजेंट GDD बनाकर रुकता है → आप Issue में `approved` कमेंट करें
4. बाकी सब ऑटोमैटिक — आखिर में Actions के **Artifacts** में APK मिलेगी
5. मैन्युअल बिल्ड: Actions → **Export Game (APK)** → Run workflow

## ज़रूरी नियम

- एसेट **सिर्फ CC0/MIT** लाइसेंस (`AGENTS.md` में एजेंट बाध्य है)
- Secrets / keystore कभी commit नहीं — `.gitignore` कानून है
- एक गेम = एक Issue; iteration कैप और quality gates `AGENTS.md` में तय हैं
- Play Store पर पब्लिश करना (अकाउंट, फीस, बटन) सिर्फ इंसान का काम है

## फाइलें

| फाइल | काम |
|---|---|
| `AGENTS.md` | एजेंट का मैनुअल — फेज़, नियम, गार्डरेल्स, टेस्ट कमांड्स |
| `.github/workflows/agent-build.yml` | Issue/लेबल से एजेंट ट्रिगर |
| `.github/workflows/export.yml` | APK एक्सपोर्ट (हल्का जॉब, 5-15 मिनट) |
| `.github/actions/setup-dev-env/` | Godot 4.7.2 + Node + Python इंस्टॉल |
| `game/` | Godot 4.7.2 प्रोजेक्ट स्केलेटन (main scene, Android preset) |
| `docs/` | GDD टेम्पलेट, टास्क लिस्ट, बिल्ड-स्टेट चेकपॉइंट |