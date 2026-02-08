// @ts-ignore
const { PDFParse } = require('pdf-parse');

async function testPdfParse() {
    try {
        console.log("Creating dummy PDF buffer...");
        // Minimal valid PDF
        const pdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUgcGFnZXM9MQo8PAogIC9UeXBlIC9QYWdlcwogIC9LaWRzIFsgMyAwIFIgXQogIC9Db3VudCAxCj4+CmVuZG9iagoKMyAwIG9iaiAgJSBwYWdlPTEKPDwKICAvVHlwZSAvUGFnZQogIC9QYXJlbnQgMiAwIFIKICAvTWVkaWFCb3ggWyAwIDAgNTAwIDgwMCBdCiAgL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iagokNCAwIG9iagolsIGNvbnRlbnQgc3RyZWFtCjw8CiAgL0xlbmd0aCAxNQo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAgCjAwMDAwMDAxNTcgMDAwMDAgbiAgCjAwMDAwMDAyNTUgMDAwMDAgbiAgCnRyYWlsZXIKPDwKICAvU2l6ZSA1CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMzOQolJUVPRgo=";
        const buffer = Buffer.from(pdfBase64, 'base64');

        console.log("Parsing PDF with v2 API...");
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();

        console.log("Success! Text:", data.text);
    } catch (error) {
        console.error("PDF Parse Failed:", error);
    }
}

testPdfParse();
