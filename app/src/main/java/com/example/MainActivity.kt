package com.example

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      MyApplicationTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = MaterialTheme.colorScheme.background
        ) {
          BookstoreAppScreen()
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun BookstoreAppScreen() {
  var webViewInstance by remember { mutableStateOf<WebView?>(null) }
  var canGoBack by remember { mutableStateOf(false) }
  var pageProgress by remember { mutableFloatStateOf(0f) }
  var isLoading by remember { mutableStateOf(true) }

  // Handle back button smoothly
  BackHandler(enabled = true) {
    webViewInstance?.let { wv ->
      // Try closing any open modal or drawer in the web interface first
      wv.evaluateJavascript(
        "(function() { " +
            "var m = document.getElementById('quickViewModal'); " +
            "var c = document.getElementById('cartDrawer'); " +
            "var w = document.getElementById('wishlistDrawer'); " +
            "var n = document.getElementById('mobileNavDrawer'); " +
            "if (m && m.classList.contains('active')) { window.readora.closeModal(); return true; } " +
            "if (c && c.classList.contains('active')) { window.readora.closeAllDrawers(); return true; } " +
            "if (w && w.classList.contains('active')) { window.readora.closeAllDrawers(); return true; } " +
            "if (n && n.classList.contains('active')) { window.readora.closeAllDrawers(); return true; } " +
            "return false; " +
            "})();"
      ) { result ->
        if (result != "true" && wv.canGoBack()) {
          wv.goBack()
        }
      }
    }
  }

  Scaffold(
    modifier = Modifier
      .fillMaxSize()
      .testTag("readora_scaffold"),
    topBar = {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .background(Color(0xFF172B35))
          .statusBarsPadding()
      ) {
        AnimatedVisibility(
          visible = isLoading,
          enter = fadeIn(),
          exit = fadeOut()
        ) {
          LinearProgressIndicator(
            progress = { pageProgress },
            modifier = Modifier
              .fillMaxWidth()
              .height(3.dp),
            color = Color(0xFFF45A50),
            trackColor = Color(0xFF203E4C)
          )
        }
      }
    }
  ) { paddingValues ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(paddingValues)
    ) {
      AndroidView(
        modifier = Modifier
          .fillMaxSize()
          .testTag("bookstore_webview"),
        factory = { context ->
          WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
              javaScriptEnabled = true
              domStorageEnabled = true
              databaseEnabled = true
              allowFileAccess = true
              allowContentAccess = true
              loadsImagesAutomatically = true
              useWideViewPort = true
              loadWithOverviewMode = true
              cacheMode = WebSettings.LOAD_DEFAULT
              displayZoomControls = false
              builtInZoomControls = false
            }

            webViewClient = object : WebViewClient() {
              override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                isLoading = true
              }

              override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                isLoading = false
                canGoBack = view?.canGoBack() ?: false
              }

              override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
              ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("file:///android_asset/")) {
                  return false
                }
                // External links can be handled inside the view
                return false
              }
            }

            webChromeClient = object : WebChromeClient() {
              override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                pageProgress = newProgress / 100f
                if (newProgress >= 100) {
                  isLoading = false
                }
              }
            }

            loadUrl("file:///android_asset/web/index.html")
            webViewInstance = this
          }
        },
        update = { webView ->
          webViewInstance = webView
        }
      )
    }
  }
}
