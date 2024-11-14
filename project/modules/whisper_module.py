#위스퍼 사용 위한 코드

import whisper

def transcribe_audio(audio_file_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_file_path)
    return result['text']

