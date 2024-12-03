import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import os

@pytest.fixture
def sample_pdf(test_data_dir):
    """Create a sample PDF file for testing"""
    pdf_path = test_data_dir / "pdfs" / "test.pdf"
    with open(pdf_path, "wb") as f:
        # Create a minimal valid PDF file
        f.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/Name /F1\n/BaseFont /Helvetica\n/Encoding /MacRomanEncoding\n>>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000015 00000 n\n0000000061 00000 n\n0000000114 00000 n\n0000000229 00000 n\n0000000328 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n406\n%%EOF")
    return pdf_path

def test_upload_pdf_success(test_client: TestClient, auth_headers, sample_pdf):
    """Test successful PDF upload"""
    with open(sample_pdf, "rb") as f:
        response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert "path" in data
    assert data["filename"] == "test.pdf"

def test_upload_pdf_invalid_file(test_client: TestClient, auth_headers, test_data_dir):
    """Test uploading invalid file type"""
    invalid_file = test_data_dir / "test.txt"
    with open(invalid_file, "w") as f:
        f.write("This is not a PDF")
    
    with open(invalid_file, "rb") as f:
        response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]

def test_upload_pdf_too_large(test_client: TestClient, auth_headers, test_data_dir):
    """Test uploading file exceeding size limit"""
    large_file = test_data_dir / "large.pdf"
    max_size = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # Default 10MB
    
    # Create a file slightly larger than max size
    with open(large_file, "wb") as f:
        f.write(b"0" * (max_size + 1024))
    
    with open(large_file, "rb") as f:
        response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("large.pdf", f, "application/pdf")}
        )
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]

def test_list_pdfs(test_client: TestClient, auth_headers, sample_pdf):
    """Test listing uploaded PDFs"""
    # Upload a PDF first
    with open(sample_pdf, "rb") as f:
        test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    
    response = test_client.get(
        "/pdf/list",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert all("filename" in pdf and "path" in pdf for pdf in data)

def test_delete_pdf(test_client: TestClient, auth_headers, sample_pdf):
    """Test deleting a PDF"""
    # Upload a PDF first
    with open(sample_pdf, "rb") as f:
        upload_response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    pdf_path = upload_response.json()["path"]
    
    # Delete the PDF
    response = test_client.delete(
        f"/pdf/{pdf_path}",
        headers=auth_headers
    )
    assert response.status_code == 200
    
    # Verify PDF is deleted
    list_response = test_client.get(
        "/pdf/list",
        headers=auth_headers
    )
    pdfs = list_response.json()
    assert not any(pdf["path"] == pdf_path for pdf in pdfs)

def test_delete_nonexistent_pdf(test_client: TestClient, auth_headers):
    """Test deleting a non-existent PDF"""
    response = test_client.delete(
        "/pdf/nonexistent.pdf",
        headers=auth_headers
    )
    assert response.status_code == 404
    assert "PDF not found" in response.json()["detail"]

def test_concurrent_uploads(test_client: TestClient, auth_headers, sample_pdf):
    """Test uploading multiple PDFs concurrently"""
    import asyncio
    import aiohttp
    
    async def upload_pdf():
        async with aiohttp.ClientSession() as session:
            with open(sample_pdf, "rb") as f:
                data = aiohttp.FormData()
                data.add_field("file", f, 
                             filename="test.pdf",
                             content_type="application/pdf")
                async with session.post(
                    "http://testserver/pdf/upload",
                    headers=auth_headers,
                    data=data
                ) as response:
                    return await response.json()
    
    # Upload 5 PDFs concurrently
    loop = asyncio.get_event_loop()
    tasks = [upload_pdf() for _ in range(5)]
    responses = loop.run_until_complete(asyncio.gather(*tasks))
    
    assert len(responses) == 5
    assert all("filename" in response and "path" in response 
              for response in responses)
    
    # Verify all PDFs are listed
    list_response = test_client.get(
        "/pdf/list",
        headers=auth_headers
    )
    pdfs = list_response.json()
    assert len(pdfs) >= 5
