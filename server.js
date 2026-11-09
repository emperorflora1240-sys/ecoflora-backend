const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai'); // ใช้ SDK ทางการของ Google GenAI

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// ใส่ Gemini API Key ของคุณที่นี่
const ai = new GoogleGenAI({ apiKey: 'YOUR_GEMINI_API_KEY' });

app.post('/api/analyze-plant', async (req, res) => {
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'ไม่พบข้อมูลรูปภาพ' });
        }

        // เรียกใช้งาน Gemini Multimodal Model (gemini-2.5-flash) เพื่อวิเคราะห์ภาพพืช
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType || 'image/jpeg'
                    }
                },
                {
                    text: 'วิเคราะห์รูปภาพพืชนี้อย่างละเอียดและตอบกลับเป็นภาษาไทย ในรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้: {"name": "ชื่อพืช/ชื่อวิทยาศาสตร์", "status": "สถานะเช่น พืชพื้นถิ่น หรือ พืชรุกราน", "advice": "คำแนะนำเชิงนิเวศหรือการดูแล", "confidence": "ความแม่นยำ เช่น 98.5%"}'
                }
            ]
        });

        res.json({ success: true, result: response.text() });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผลของ AI' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
