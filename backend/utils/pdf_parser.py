import io
import PyPDF2

def extract_text_from_pdf(file_bytes: bytes, filename: str = "") -> str:
    filename_lower = filename.lower()
    
    # TXT file
    if filename_lower.endswith('.txt'):
        return file_bytes.decode('utf-8', errors='ignore').strip()
    
    # DOCX file
    if filename_lower.endswith('.docx'):
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join([para.text for para in doc.paragraphs]).strip()
        except:
            return ""
    
    # Default: PDF
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()
