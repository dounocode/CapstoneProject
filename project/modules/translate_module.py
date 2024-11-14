#deep-translator 라이브러리 사용을 위한 코드

from deep_translator import GoogleTranslator

def translate_text(text, target_lang="ko"):
    translator = GoogleTranslator(source='auto', target=target_lang)
    return translator.translate(text)

