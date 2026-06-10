from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from groq import Groq
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch, json, re, datetime, base64, io

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

GROQ_API_KEY = ""
DB_FOLDER    = "./chroma_db"
DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"
feedback_log = []
query_log    = []

print("🔧 Memuat resources...")
embeddings   = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
vector_store = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)
llm          = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile", api_key=GROQ_API_KEY)
groq_client  = Groq(api_key=GROQ_API_KEY)

print("🔭 Memuat BLIP (caption only)...")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model     = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(DEVICE)
print(f"✅ Resources siap! Device: {DEVICE}")
print("ℹ️  Deteksi gambar: BLIP caption + Groq Vision (Llama-4-Scout) — CLIP dihapus")

SYSTEM_PROMPT = """Anda adalah TrafficAI, asisten AI super cerdas untuk edukasi hukum lalu lintas Indonesia (UU No. 22 Tahun 2009).

KONTEKS DARI DATABASE:
{context}

ATURAN UTAMA:
1. Pahami maksud user. Apakah dia bertanya pasal, menyapa, atau menceritakan kronologi kejadian?
2. Jika user menceritakan kejadian: Deteksi SEMUA pelanggaran yang ada sekecil apapun (berlapis).
3. Jika user bertanya pasal/menyapa: Jawab dengan natural, ramah, dan informatif.
4. JAWAB HANYA DALAM FORMAT JSON MURNI TANPA KOMENTAR APAPUN.

FORMAT JSON (WAJIB PERSIS):
{{
  "is_violation": true,
  "message": "Pesan balasan / Ringkasan deteksi",
  "violations": [
    {{
      "jenis": "Nama Pelanggaran Singkat",
      "pasal": "Pasal X ayat (Y) UU No. 22 Tahun 2009",
      "sanksi": "Kurungan maks. X bulan / Denda maks. RpY",
      "penjelasan": "Alasan melanggar (1 kalimat pendek)",
      "severity": "high|medium|low"
    }}
  ]
}}

Jika tidak ada pelanggaran: "is_violation": false, "violations": [].
INPUT USER: {question}"""

VISION_DETECTION_PROMPT = """Anda adalah sistem analisis visual pelanggaran lalu lintas Indonesia yang SANGAT TELITI dan KONSERVATIF.

TUGAS: Periksa gambar ini dan identifikasi pelanggaran yang BENAR-BENAR TERLIHAT JELAS.

ATURAN KETAT — WAJIB DIIKUTI:
1. Hanya laporkan yang 100% terlihat nyata — TIDAK BOLEH berasumsi atau menebak
2. Jika tidak terlihat jelas → JANGAN laporkan
3. Tentukan jenis kendaraan PERTAMA (motor/mobil/truk/bus)
4. SABUK PENGAMAN → hanya untuk MOBIL. Motor TIDAK pakai sabuk — jangan pernah laporkan tanpa_sabuk untuk motor
5. HELM → hanya untuk MOTOR
6. BONCENG 3 → hitung orang di motor secara teliti, harus jelas terlihat 3+ orang
7. SPION → hanya laporkan jika kamera menghadap sisi motor dan spion jelas tidak ada
8. PLAT → hanya jika plat benar-benar tidak terlihat di posisi depan/belakang
9. HP → hanya jika pengendara JELAS memegang/melihat ponsel

KATEGORI YANG BISA DILAPORKAN:
- tanpa_helm_pengendara  (kepala pengendara motor tidak ada helm)
- tanpa_helm_penumpang   (kepala penumpang motor tidak ada helm)
- bonceng_3              (jelas terlihat 3+ orang di 1 motor)
- tanpa_sabuk            (pengemudi/penumpang MOBIL tidak pakai sabuk)
- pakai_hp               (pengendara jelas memegang ponsel)
- tanpa_spion            (spion motor jelas tidak ada, terlihat dari sudut yang tepat)
- tanpa_plat             (plat nomor tidak ada sama sekali)
- parkir_terlarang       (parkir di zona larangan yang terlihat jelas)

JAWAB HANYA JSON ini (tanpa markdown):
{
  "vehicle_type": "motorcycle|car|truck|bus|unknown",
  "vehicle_description": "deskripsi kendaraan",
  "scene_description": "situasi dalam gambar",
  "total_people_on_vehicle": 0,
  "detected_violations": [
    {
      "category": "nama_kategori",
      "description": "apa yang terlihat sebagai bukti",
      "confidence": "high|medium|low",
      "reason": "penjelasan singkat"
    }
  ],
  "not_visible": ["hal yang tidak bisa dinilai karena tidak terlihat"]
}

Jika tidak ada pelanggaran: "detected_violations": []
PRINSIP: Lebih baik TIDAK melaporkan daripada melaporkan yang SALAH."""

GROQ_LEGAL_PROMPT = """Anda adalah TrafficAI, sistem hukum lalu lintas Indonesia (UU No. 22 Tahun 2009).

INPUT dari Vision AI yang telah memeriksa gambar secara langsung:
{vision_result}

TUGAS: Petakan pelanggaran ke pasal hukum.

ATURAN KRITIS:
1. HANYA petakan yang ada di "detected_violations" — JANGAN tambahkan sendiri
2. Jika detected_violations kosong → is_violation: false
3. Sesuaikan confidence dari Vision AI

REFERENSI PASAL:
- tanpa_helm_pengendara → Pasal 291 ayat (1), maks 1 bulan / Rp250.000, severity: medium
- tanpa_helm_penumpang  → Pasal 291 ayat (2), maks 1 bulan / Rp250.000, severity: medium
- bonceng_3             → Pasal 292, maks 1 bulan / Rp250.000, severity: medium
- tanpa_sabuk           → Pasal 289, maks 1 bulan / Rp250.000, severity: medium
- pakai_hp              → Pasal 283, maks 3 bulan / Rp750.000, severity: high
- tanpa_spion           → Pasal 285 ayat (1), maks 1 bulan / Rp250.000, severity: low
- tanpa_plat            → Pasal 280, maks 2 bulan / Rp500.000, severity: medium
- parkir_terlarang      → Pasal 287 ayat (3), maks 2 bulan / Rp500.000, severity: medium

FORMAT OUTPUT (tanpa markdown):
{{
  "is_violation": true,
  "message": "Ringkasan 1-2 kalimat tentang apa yang terlihat",
  "violations": [
    {{
      "jenis": "Nama Pelanggaran",
      "pasal": "Pasal X ayat (Y) UU No. 22 Tahun 2009",
      "sanksi": "Kurungan maks. X bulan / Denda maks. RpY",
      "penjelasan": "Bukti visual spesifik dari Vision AI",
      "severity": "high|medium|low",
      "confidence": "high|medium|low"
    }}
  ]
}}

Jika tidak ada pelanggaran: {{"is_violation": false, "message": "Tidak ada pelanggaran yang terlihat jelas.", "violations": []}}"""


def clamp_score(score):
    try:
        return max(0.0, min(1.0, float(score)))
    except Exception:
        return 0.0


def distance_to_similarity(distance):
    """
    Mengubah distance ChromaDB menjadi similarity score 0-1.
    Semakin kecil distance, semakin besar similarity.
    """
    try:
        distance = float(distance)

        # Jika distance negatif, gunakan nilai absolut agar tetap bisa dikonversi
        distance = abs(distance)

        similarity = 1 / (1 + distance)
        return round(clamp_score(similarity), 4)
    except Exception:
        return 0.0


def get_context_with_scores(query):
    try:
        # Mengambil distance dari ChromaDB
        docs_and_scores = vector_store.similarity_search_with_score(query, k=6)

        context = "\n\n".join([d.page_content for d, _ in docs_and_scores])

        scores = []
        for d, raw_distance in docs_and_scores:
            similarity_score = distance_to_similarity(raw_distance)

            scores.append({
                "snippet": d.page_content[:120] + "...",
                "distance": round(float(raw_distance), 4),
                "score": similarity_score
            })

        return context, scores

    except Exception as e:
        print(f"[RAG ERROR] {e}")
        retriever = vector_store.as_retriever(search_kwargs={"k": 6})
        docs = retriever.invoke(query)
        return "\n\n".join([d.page_content for d in docs]), []

def clean_json(text):
    text = text.strip()
    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'^```\s*',     '', text)
    text = re.sub(r'\s*```$',     '', text)
    return text.strip()

def decode_image(b64):
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")

def run_blip_caption(image):
    try:
        inputs = blip_processor(image, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            out = blip_model.generate(**inputs, max_new_tokens=80)
        return blip_processor.decode(out[0], skip_special_tokens=True).strip()
    except Exception as e:
        return f"(BLIP gagal: {e})"

def compress_image_for_api(image_b64: str, max_size: int = 800) -> str:
    try:
        img = decode_image(image_b64)
        w, h = img.size
        if max(w, h) > max_size:
            ratio = max_size / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85, optimize=True)
        return base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception:
        return image_b64

def run_groq_vision(image_b64: str) -> dict:
    compressed = compress_image_for_api(image_b64, max_size=800)
    response = groq_client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
                {"type": "text",      "text": VISION_DETECTION_PROMPT}
            ]
        }],
        temperature=0,
        max_tokens=1024,
    )
    return json.loads(clean_json(response.choices[0].message.content))

def run_groq_legal(vision_result: dict) -> dict:
    prompt = GROQ_LEGAL_PROMPT.format(vision_result=json.dumps(vision_result, ensure_ascii=False, indent=2))
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0, max_tokens=1024,
    )
    return json.loads(clean_json(response.choices[0].message.content))


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File terlalu besar (maks 10MB)."}), 413


@app.route("/api/chat", methods=["POST"])
def chat():
    data       = request.get_json()
    user_input = (data or {}).get("message", "").strip()
    if not user_input:
        return jsonify({"error": "Input tidak boleh kosong"}), 400
    try:
        context, confidence_scores = get_context_with_scores(user_input)
        prompt   = SYSTEM_PROMPT.format(context=context, question=user_input)
        response = llm.invoke(prompt).content
        result   = json.loads(clean_json(response))
        avg_conf = round(clamp_score(
            sum(s["score"] for s in confidence_scores) / len(confidence_scores)
            if confidence_scores else 0), 4)
        result["confidence_scores"] = confidence_scores
        result["avg_confidence"]    = avg_conf
        query_log.append({"query": user_input, "mode": "text",
                          "violations_count": len(result.get("violations", [])),
                          "is_violation": result.get("is_violation", False),
                          "avg_confidence": avg_conf,
                          "timestamp": datetime.datetime.now().isoformat()})
        return jsonify(result)
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Gagal parse JSON: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/detect-image", methods=["POST"])
def detect_image():
    data      = request.get_json() or {}
    image_b64 = data.get("image_base64", "").strip()
    filename  = data.get("filename", "image.jpg")

    if not image_b64:
        return jsonify({"error": "image_base64 tidak boleh kosong"}), 400
    if len(image_b64) > 8_000_000:
        return jsonify({"error": "Gambar terlalu besar (maks ~6MB)."}), 413

    # Step 1: BLIP caption (lokal)
    blip_caption = "(tidak tersedia)"
    try:
        blip_caption = run_blip_caption(decode_image(image_b64))
    except Exception as e:
        blip_caption = f"(BLIP error: {e})"

    # Step 2: Groq Vision — model benar-benar melihat gambar
    try:
        vision_result = run_groq_vision(image_b64)
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Vision AI tidak menghasilkan JSON valid: {e}", "step": "vision"}), 500
    except Exception as e:
        err = str(e)
        if "429" in err or "rate_limit" in err.lower():
            return jsonify({"error": "Rate limit Groq Vision. Tunggu 1 menit.", "step": "vision"}), 429
        return jsonify({"error": f"Vision AI gagal: {err}", "step": "vision"}), 500

    # Step 3: Groq Legal — petakan ke pasal
    try:
        result = run_groq_legal(vision_result)
        result["pipeline"] = {
            "step1_model":         "BLIP (local) — caption only",
            "step2_model":         "Groq Vision: meta-llama/llama-4-scout-17b-16e-instruct",
            "step3_model":         "Groq LLM: llama-3.3-70b-versatile",
            "blip_caption":        blip_caption,
            "vehicle_type":        vision_result.get("vehicle_type", "unknown"),
            "vehicle_description": vision_result.get("vehicle_description", ""),
            "scene_description":   vision_result.get("scene_description", ""),
            "total_people":        vision_result.get("total_people_on_vehicle", 0),
            "not_visible":         vision_result.get("not_visible", []),
            "raw_detections":      vision_result.get("detected_violations", []),
            "device":              DEVICE,
        }
        query_log.append({"query": f"[GAMBAR] {filename}", "mode": "vision",
                          "violations_count": len(result.get("violations", [])),
                          "is_violation": result.get("is_violation", False),
                          "avg_confidence": 0,
                          "timestamp": datetime.datetime.now().isoformat()})
        return jsonify(result)
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Legal AI tidak menghasilkan JSON valid: {e}", "step": "legal"}), 500
    except Exception as e:
        err = str(e)
        if "429" in err or "rate_limit" in err.lower():
            return jsonify({"error": "Rate limit Groq. Tunggu 1 menit.", "step": "legal"}), 429
        return jsonify({"error": f"Legal AI gagal: {err}", "step": "legal"}), 500


@app.route("/api/feedback", methods=["POST"])
def feedback():
    data = request.get_json() or {}
    feedback_log.append({"message_id": data.get("messageId"), "feedback": data.get("feedback"),
                          "query": data.get("query", ""), "timestamp": datetime.datetime.now().isoformat()})
    return jsonify({"status": "ok"})


@app.route("/api/stats", methods=["GET"])
def stats():
    total    = len(query_log)
    viol_q   = [q for q in query_log if q["is_violation"]]
    avg_viol = (sum(q["violations_count"] for q in viol_q) / len(viol_q)) if viol_q else 0
    avg_conf = clamp_score(sum(q["avg_confidence"] for q in query_log) / total if total else 0)
    pos  = len([f for f in feedback_log if f["feedback"] == "up"])
    neg  = len([f for f in feedback_log if f["feedback"] == "down"])
    sat_rate = round(pos / (pos + neg) * 100, 1) if (pos + neg) > 0 else 0
    return jsonify({
        "total_queries":           total,
        "text_queries":            len([q for q in query_log if q.get("mode") == "text"]),
        "vision_queries":          len([q for q in query_log if q.get("mode") == "vision"]),
        "violation_queries":       len(viol_q),
        "non_violation_queries":   total - len(viol_q),
        "avg_violations_per_case": round(avg_viol, 2),
        "avg_confidence":          round(avg_conf, 4),
        "positive_feedback":       pos,
        "negative_feedback":       neg,
        "satisfaction_rate":       sat_rate,
        "recent_queries":          query_log[-10:][::-1],
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "text_model":   "llama-3.3-70b-versatile",
        "vision_step1": "BLIP (local) — caption only",
        "vision_step2": "Groq Vision: meta-llama/llama-4-scout-17b-16e-instruct",
        "vision_step3": "Groq LLM: llama-3.3-70b-versatile (legal mapping)",
        "device":       DEVICE,
        "architecture": "BLIP caption → Groq Vision (real image understanding) → Groq Legal Mapping",
        "note":         "CLIP dihapus — diganti Groq Vision untuk akurasi jauh lebih tinggi"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)