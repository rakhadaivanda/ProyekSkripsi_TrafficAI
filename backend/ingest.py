import pandas as pd
from langchain_community.document_loaders import DataFrameLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import os, shutil

# ==========================================
# KONFIGURASI
# ==========================================
CSV_FILE  = "data/pelanggaran_lalin.csv"
DB_FOLDER = "./chroma_db"

def create_knowledge_base():
    print(f"🚀 Memulai ingestion dari: {CSV_FILE}")

    if not os.path.exists(CSV_FILE):
        print(f"❌ File tidak ditemukan: {CSV_FILE}")
        return

    # Baca CSV
    df = pd.read_csv(CSV_FILE, encoding="utf-8-sig")
    df.columns = df.columns.str.strip()
    print(f"📊 {len(df)} data pelanggaran ditemukan")
    print(f"🔎 Kolom: {df.columns.tolist()}")

    # Gabungkan kolom jadi satu teks konteks RAG
    # Format: "Pelanggaran: X. Pasal: Y. Sanksi: Z. Penjelasan: W. Kata kunci: V."
    df["rag_context"] = (
        "Pelanggaran: "   + df["Jenis_Pelanggaran"].astype(str) + ". "
        "Pasal: "         + df["Pasal"].astype(str)             + ". "
        "Sanksi: "        + df["Sanksi"].astype(str)            + ". "
        "Penjelasan: "    + df["Penjelasan"].astype(str)        + ". "
        "Kata kunci: "    + df["Kata_Kunci"].astype(str)        + ". "
        "Severity: "      + df["Severity"].astype(str)          + "."
    )

    # Buat LangChain documents
    loader = DataFrameLoader(df, page_content_column="rag_context")
    docs   = loader.load()
    print(f"📄 {len(docs)} dokumen siap diproses")

    # Hapus DB lama
    if os.path.exists(DB_FOLDER):
        print("🧹 Menghapus database lama...")
        shutil.rmtree(DB_FOLDER)

    # Load model embedding
    print("🧠 Memuat model embedding (paraphrase-multilingual-mpnet-base-v2)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )

    # Simpan ke ChromaDB
    print("💾 Menyimpan ke ChromaDB...")
    Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=DB_FOLDER,
        collection_metadata={"hnsw:space": "cosine"}   # Cosine similarity (standar semantic search)
    )

    print("=" * 45)
    print("✅ Knowledge base berhasil dibuat!")
    print(f"📁 Lokasi  : {DB_FOLDER}")
    print(f"📝 Dokumen : {len(docs)} entri")
    print("=" * 45)

if __name__ == "__main__":
    create_knowledge_base()
