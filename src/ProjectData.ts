export interface Project {
  id: string;
  name: string;
  category: 'basic' | 'admob' | 'firebase' | 'native' | 'modmenu';
  explanation: string;
  steps: string[];
  codeFiles: { name: string; content: string; language: string; explanation: string }[];
  howToRun: string;
  commonErrors: { error: string; fix: string }[];
  resultDescription: string;
}

export const projects: Project[] = [
  {
    id: 'android-project',
    name: 'Android Project العادي',
    category: 'basic',
    explanation: 'هذا المشروع هو أساس كل شيء. سنحتاج فقط لإنشاء مجلد يحتوي على هيكل تطبيق أندرويد بسيط بدون أي إضافات معقدة. هو مثل لبنة البناء الأولى.',
    steps: [
      'افتح تطبيق AIDE Plus.',
      'اضغط على "New Android Project".',
      'اختر اسماً لمشروعك (مثلاً: MyFirstApp).',
      'اختر الـ Package Name (مثلاً: com.hero.myapp).',
      'اضغط Create.'
    ],
    codeFiles: [
      {
        name: 'MainActivity.java',
        language: 'java',
        explanation: 'هذا الملف هو "عقل" التطبيق، يخبر الأندرويد ماذا يفعل عند التشغيل.',
        content: `package com.hero.myapp;

import android.app.Activity;
import android.os.Bundle;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // هذا السطر يربط الكود بالتصميم (Layout)
        setContentView(R.layout.main);
    }
}`
      },
      {
        name: 'main.xml',
        language: 'xml',
        explanation: 'هذا الملف هو "شكل" التطبيق، هنا نضع الأزرار والنصوص.',
        content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="مرحباً بك يا بطل في عالم البرمجة!"
        android:textSize="20sp" />

</LinearLayout>`
      }
    ],
    howToRun: 'بكل بساطة، اضغط على زر المثلث (Run) الموجود في أعلى شاشة AIDE Plus. التطبيق سيقوم بجمع الكود (Build) ثم سيطلب منك تثبيت ملف APK. بعد التثبيت، افتحه!',
    commonErrors: [
      {
        error: 'Syntax Error (خطأ في الكتابة)',
        fix: 'تأكد أن كل سطر ينتهي بفاصلة منقوطة (;) وأن الأقواس مفتوحة ومغلقة بشكل صحيح.'
      }
    ],
    resultDescription: 'سترى نصاً في منتصف الشاشة يقول: "مرحباً بك يا بطل في عالم البرمجة!".'
  },
  {
    id: 'androidx-app',
    name: 'AndroidX App',
    category: 'basic',
    explanation: 'AndroidX هي المكتبة الحديثة من جوجل التي استبدلت المكتبات القديمة. هي أسرع وأفضل في دعم الأجهزة الجديدة.',
    steps: [
      'في القائمة الرئيسية لـ AIDE، اختر "New AndroidX App".',
      'أكمل البيانات (الاسم والباكيج).',
      'ستلاحظ أن AIDE قام بكتابة كود أكثر تعقيداً قليلاً، وهذا طبيعي.'
    ],
    codeFiles: [
      {
        name: 'MainActivity.java',
        language: 'java',
        explanation: 'لاحظ هنا استخدام AppCompatActivity بدلاً من Activity العادية.',
        content: `package com.example.androidx;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}`
      }
    ],
    howToRun: 'اضغط Run وانتظر قليلاً، التحميل قد يستغرق وقت أطول قليلاً لأن AndroidX أكبر.',
    commonErrors: [
      {
        error: 'Manifest merger failed',
        fix: 'تأكد أنك تستخدم إصداراً حديثاً من AIDE يدعم AndroidX وأن ملف build.gradle مضبوط بشكل صحيح.'
      }
    ],
    resultDescription: 'شاشة بيضاء مكتوب عليها Hello World بتصميم أحدث.'
  },
  {
    id: 'lgl-mod-menu',
    name: 'LGL Mod Menu (العادي)',
    category: 'modmenu',
    explanation: 'المود مينيو (Mod Menu) هو نافذة تظهر فوق الألعاب لتغيير القيم (مثل الفلوس أو السرعة). هذا المشروع يعلمك كيف تبدأ في صناعة هذه القائمة.',
    steps: [
      'قم بتحميل سورس LGL Mod Menu من GitHub أو تواصل معي.',
      'افتح السورس في AIDE Plus كـ Gradle Project.',
      'ابحث عن ملف FloatingModMenuService.java.',
      'اضغط Run وثبت التطبيق.'
    ],
    codeFiles: [
      {
        name: 'Menu.cpp',
        language: 'cpp',
        explanation: 'هذا الكود بلغة C++ هو الذي يرسم القائمة وأزرار الـ Toggle.',
        content: `void *instance = NULL;

bool feature1 = false;

void DrawMenu() {
    if (imgui::Button("Increase Speed")) {
        // كود زيادة السرعة هنا
    }
    imgui::Checkbox("God Mode", &feature1);
}`
      }
    ],
    howToRun: 'بما أن هذا المشروع يحتوي على كود C++ (Native)، سيحتاج AIDE لتحميل الـ NDK. بعد التحميل، اضغط Run.',
    commonErrors: [
      {
        error: 'NDK not found',
        fix: 'يجب عليك تثبيت حزمة NDK داخل AIDE من الإعدادات.'
      }
    ],
    resultDescription: 'عند فتح التطبيق، ستظهر أيقونة عائمة. اضغط عليها لتظهر لك قائمة الخيارات.'
  }
];
