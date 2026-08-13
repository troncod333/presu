import React, { useState } from 'react';
import { Smartphone, Code2, Copy, Check, Download, ExternalLink, X, BookOpen } from 'lucide-react';

interface AndroidGuideModalProps {
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'java' | 'manifest' | 'layout'>('guide');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const mainActivityJava = `package com.tu.proyecto;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    private static final int MY_PERMISSIONS_REQUEST_LOCATION = 99;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        
        // Configuraciones necesarias para Leaflet, LocalStorage y PWA
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setDatabaseEnabled(true);

        myWebView.setWebViewClient(new WebViewClient());

        // Permisos de GPS dentro del WebView para el mapa
        myWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        requestLocationPermission();

        // Cargar el archivo exportado desde assets
        myWebView.loadUrl("file:///android_asset/index.html");
    }

    private void requestLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    MY_PERMISSIONS_REQUEST_LOCATION);
        }
    }

    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;

  const androidManifestXml = `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.tu.proyecto">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Presupuestador Pro"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const activityMainXml = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</RelativeLayout>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              📱 Exportar App para Android Studio (.APK / WebView)
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 pb-2 text-xs font-semibold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía Paso a Paso</span>
          </button>

          <button
            onClick={() => setActiveTab('java')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'java'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>MainActivity.java</span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manifest'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>AndroidManifest.xml</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>activity_main.xml</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto flex-1 pr-1 text-xs">
          
          {activeTab === 'guide' && (
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200">
                <p className="font-bold mb-1">🚀 ¡Tu aplicación ya está adaptada para Android!</p>
                <p className="text-[11px] leading-relaxed">
                  Puedes ejecutar este proyecto directamente en el navegador del celular o empaquetarlo en un APK nativo mediante WebView en Android Studio con los códigos provistos en esta ventana.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-gray-900 dark:text-white text-sm">Pasos para compilar APK en Android Studio:</div>
                
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <strong>1. Instala Android Studio:</strong> Abre Android Studio y crea un nuevo proyecto con la plantilla <em>"Empty Views Activity"</em>.
                  </li>
                  <li className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <strong>2. Crea la carpeta Assets:</strong> Haz clic derecho en la carpeta <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">app/src/main/</code> &gt; <em>New &gt; Folder &gt; Assets Folder</em>.
                  </li>
                  <li className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <strong>3. Copia el archivo Web:</strong> Copia el archivo <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">index.html</code> dentro de la nueva carpeta <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">assets</code>.
                  </li>
                  <li className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <strong>4. Pega los archivos Java y XML:</strong> Usa las pestañas superiores para copiar <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">MainActivity.java</code>, <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">AndroidManifest.xml</code> y <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">activity_main.xml</code>.
                  </li>
                  <li className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <strong>5. ¡Genera tu APK!:</strong> Haz clic en el botón <strong>Run (Play Verde)</strong> o ve a <em>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</em>.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'java' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">app/src/main/java/tu/paquete/MainActivity.java</span>
                <button
                  onClick={() => copyToClipboard(mainActivityJava, 'java')}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  {copiedFile === 'java' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'java' ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                {mainActivityJava}
              </pre>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">app/src/main/AndroidManifest.xml</span>
                <button
                  onClick={() => copyToClipboard(androidManifestXml, 'manifest')}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  {copiedFile === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'manifest' ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                {androidManifestXml}
              </pre>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">app/src/main/res/layout/activity_main.xml</span>
                <button
                  onClick={() => copyToClipboard(activityMainXml, 'layout')}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  {copiedFile === 'layout' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'layout' ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                {activityMainXml}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 shrink-0 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
