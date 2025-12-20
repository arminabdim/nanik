
import { GoogleGenAI } from "@google/genai";
import { Sale, Expense, Product } from "../types";

export const getBusinessInsights = async (sales: Sale[], expenses: Expense[], products: Product[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Comment: Removed the stock check because the Product interface does not define a 'stock' property.
  const summary = `
    Sales Count: ${sales.length}
    Total Revenue: ${sales.reduce((acc, s) => acc + s.totalAmount, 0)}
    Total Expenses: ${expenses.reduce((acc, e) => acc + e.amount, 0)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `شما یک مشاور بیزنس برای یک نانوایی سنتی هستید. با توجه به داده‌های زیر، ۳ توصیه کلیدی برای افزایش سودآوری و مدیریت بهتر به زبان فارسی و لحنی محترمانه بدهید: ${summary}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "متاسفانه در حال حاضر امکان دریافت مشاوره هوشمند وجود ندارد.";
  }
};
