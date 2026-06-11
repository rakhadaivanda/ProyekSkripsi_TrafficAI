---
title: TrafficAI Backend
emoji: 🚗
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# TrafficAI — Backend API

Sistem AI untuk edukasi hukum lalu lintas Indonesia (UU No. 22 Tahun 2009).

## Fitur
- **Text Chat**: Analisis pelanggaran dari deskripsi teks menggunakan RAG + LLM
- **Image Detection**: Deteksi pelanggaran dari gambar menggunakan BLIP + Groq Vision
- **Legal Mapping**: Pemetaan otomatis ke pasal hukum yang relevan

## Tech Stack
- Flask (Python)
- ChromaDB (Vector Database)
- BLIP (Image Captioning)
- Groq API (LLM + Vision)
- LangChain (RAG Pipeline)
