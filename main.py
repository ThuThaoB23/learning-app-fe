import pyttsx3
import os
from datetime import datetime

def choose_us_voice(engine):
    voices = engine.getProperty("voices")
    
    for voice in voices:
        name = voice.name.lower()
        if "english" in name and ("united states" in name or "us" in name):
            engine.setProperty("voice", voice.id)
            print(f"Using voice: {voice.name}")
            return
    
    print("⚠ Không tìm thấy giọng US cụ thể. Dùng giọng mặc định.")

def main():
    engine = pyttsx3.init("sapi5")  # Windows speech API

    choose_us_voice(engine)

    engine.setProperty("rate", 170)   # tốc độ nói
    engine.setProperty("volume", 1.0) # âm lượng (0.0 - 1.0)

    text = input("Nhập nội dung cần chuyển thành audio: ")

    if not text.strip():
        print("Không có nội dung.")
        return

    filename = f"tts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
    filepath = os.path.join(os.getcwd(), filename)

    engine.save_to_file(text, filepath)
    engine.runAndWait()

    print(f"\n✅ Đã lưu file tại: {filepath}")

if __name__ == "__main__":
    main()