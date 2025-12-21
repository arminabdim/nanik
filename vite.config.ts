import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // بارگذاری متغیرهای محیطی از پنل لیارا
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      base: '/', 
      plugins: [react()],
      define: {
        // تزریق کلید هوش مصنوعی گوگل به برنامه
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          // تنظیم مسیر اصلی پروژه
          '@': path.resolve(__dirname, './'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      }
    };
});
