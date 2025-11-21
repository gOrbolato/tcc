import os
import google.generativeai as genai

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Erro: A variável de ambiente GEMINI_API_KEY não está definida.")
    else:
        genai.configure(api_key=api_key)
        print("Modelos disponíveis para a sua chave de API:")
        for m in genai.list_models():
            print(f'- {m.name} (Métodos suportados: {m.supported_generation_methods})')
except Exception as e:
    print(f"Ocorreu um erro ao tentar listar os modelos: {e}")
